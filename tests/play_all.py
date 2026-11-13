"""Plays every person through all four rounds on a phone and a laptop viewport.
Run:  python tests/play_all.py   (needs: pip install playwright; uses the installed Google Chrome)
Starts a local server, walks many paths (the real path, every first choice, random paths),
checks for JavaScript errors, horizontal scrolling, Back-button undo and the ending screen."""
import http.server, threading, functools, os, random, json, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('SHOTS', os.path.join(ROOT, 'tests', 'shots'))
os.makedirs(OUT, exist_ok=True)
Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
Handler.log_message = lambda *a: None
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = 'http://127.0.0.1:%d/' % srv.server_address[1]

problems, runs, slow = [], 0, []

def click(page, sel):
    try:
        page.click(sel, timeout=8000)
    except Exception:
        slow.append(sel)
        page.eval_on_selector(sel, 'e=>e.click()')

STATE = "JSON.stringify((()=>{const s=KatrinaApp.state();return s.st?{r:s.r,ph:s.phase,st:s.st}:{ph:s.phase}})())"

def overflow(page, tag):
    w = page.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")
    if w[0] > w[1] + 1:
        problems.append('%s: horizontal scroll %s' % (tag, w))

def play(page, who, strategy, tag, shots=False):
    global runs
    page.goto(BASE + 'index.html')
    click(page, 'button[data-who="%s"]' % who)
    overflow(page, tag + ' intro')
    if shots: page.screenshot(path='%s/%s-0-intro.png' % (OUT, tag), full_page=True)
    click(page, '#b-next')
    real = page.evaluate("KATRINA.people['%s'].realPath" % who)
    for r in range(4):
        page.wait_for_selector('.choices')
        overflow(page, '%s r%d' % (tag, r + 1))
        if shots: page.screenshot(path='%s/%s-%d-round.png' % (OUT, tag, r + 1), full_page=True)
        ids = page.eval_on_selector_all('.opt:not([disabled])', 'els=>els.map(e=>e.dataset.id)')
        if not ids:
            problems.append('%s r%d: no available choice' % (tag, r + 1)); return
        if strategy == 'real':
            if real[r] is None:
                pick = ids[0]
            elif real[r] not in ids:
                problems.append('%s r%d: real choice %s not available (have %s)' % (tag, r + 1, real[r], ids)); return
            else:
                pick = real[r]
        elif isinstance(strategy, int):
            pick = ids[min(strategy, len(ids) - 1)] if r == 0 else random.choice(ids)
        else:
            pick = random.choice(ids)
        before = page.evaluate(STATE)
        click(page, '.opt[data-id="%s"]' % pick)
        # Back must restore exactly, then choose again
        click(page, '#b-back')
        after = page.evaluate(STATE)
        if before != after:
            problems.append('%s r%d: Back did not restore state' % (tag, r + 1))
        click(page, '.opt[data-id="%s"]' % pick)
        page.wait_for_selector('.cons')
        if shots: page.screenshot(path='%s/%s-%d-result.png' % (OUT, tag, r + 1), full_page=True)
        st = json.loads(page.evaluate(STATE))['st']
        if st.get('money', 0) < 0: problems.append('%s: negative money' % tag)
        click(page, '#b-next')
    page.wait_for_selector('.end')
    overflow(page, tag + ' fate')
    end = page.inner_text('.end')
    if not end.strip(): problems.append('%s: empty ending' % tag)
    if who == 'herbert':
        st = json.loads(page.evaluate(STATE))['st']
        died = 'dies' in end
        if died != (st['end'] == 'h_wait'): problems.append('%s: Ethel death mismatch (%s)' % (tag, st['end']))
    if strategy == 'real' and 'matches what' not in page.inner_text('.match'):
        problems.append('%s: real path not recognised' % tag)
    if shots: page.screenshot(path='%s/%s-5-fate.png' % (OUT, tag), full_page=True)
    # Back from fate to round 4 and forward again
    click(page, '#b-back'); page.wait_for_selector('.cons'); click(page, '#b-next'); page.wait_for_selector('.end')
    runs += 1
    return end

with sync_playwright() as p:
    try:
        browser = p.chromium.launch(channel='chrome', headless=True)
    except Exception:
        browser = p.chromium.launch(headless=True)
    endings = {}
    for vp_name, vp in [('phone', dict(width=390, height=844)), ('laptop', dict(width=1366, height=768))]:
        ctx = browser.new_context(viewport=vp, device_scale_factor=2 if vp_name == 'phone' else 1, is_mobile=vp_name == 'phone', has_touch=vp_name == 'phone')
        page = ctx.new_page()
        errs = []
        page.on('pageerror', lambda e: errs.append(str(e)))
        page.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        for who in ['mayor', 'herbert', 'kim', 'lake']:
            play(page, who, 'real', '%s-%s-real' % (vp_name, who), shots=True)
            for k in range(4):
                play(page, who, k, '%s-%s-first%d' % (vp_name, who, k))
            for seed in range(10):
                random.seed(seed * 7 + len(who))
                e = play(page, who, 'rand', '%s-%s-rand%d' % (vp_name, who, seed))
                endings.setdefault(who, set()).add(e[:60])
        # presenter
        page.goto(BASE + 'presenter.html')
        n = page.evaluate('Presenter.count()')
        for s in range(n):
            if vp_name == 'laptop': page.screenshot(path='%s/presenter-%02d.png' % (OUT, s + 1))
            page.keyboard.press('ArrowRight')
        page.keyboard.press('ArrowLeft')
        if page.evaluate('Presenter.index()') != n - 2: problems.append('presenter: back key failed')
        for e in errs: problems.append('%s JS: %s' % (vp_name, e))
        ctx.close()
    browser.close()

print('runs:', runs, '| clicks that needed a retry:', len(slow), sorted(set(slow))[:5])
for who, es in endings.items():
    print(who, 'distinct endings seen:', len(es))
print('PROBLEMS:' if problems else 'No problems found.')
for x in sorted(set(problems)): print(' -', x)
srv.shutdown()
sys.exit(1 if problems else 0)
