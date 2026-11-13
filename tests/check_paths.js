/* Back check without a browser: plays EVERY possible path of all four people through the real app.js.
   Run:  node tests/check_paths.js
   Checks: every path reaches an ending, texts have no leftovers, money never negative, pulls are valid,
   the real path is playable, and how many paths end up on the real ending ("destiny share"). */
'use strict';
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const problems = [], warn = new Set();

function makeEnv() {
  Object.keys(require.cache).forEach(k => { if (k.startsWith(ROOT)) delete require.cache[k]; });
  let handler = null;
  const app = { innerHTML: '', addEventListener: (t, f) => { handler = f; }, querySelector: () => null };
  global.window = global;
  global.window.scrollTo = () => {};
  global.document = { getElementById: id => (id === 'app' ? app : null) };
  global.Sound = { on: false, play() {}, stop() {}, toggle() {} };
  require(path.join(ROOT, 'data.js'));
  require(path.join(ROOT, 'js', 'app.js'));
  const click = (o) => handler({ target: { closest: () => Object.assign({ disabled: false, dataset: {} }, o) } });
  return { app, click, state: () => global.KatrinaApp.state(), D: global.KATRINA };
}
function available(app) {
  const out = [], all = [], re = /<button class="opt[^"]*" data-id="([^"]+)"( disabled)?/g; let m;
  while ((m = re.exec(app.innerHTML))) { all.push(m[1]); if (!m[2]) out.push(m[1]); }
  return { out, all };
}
function replay(who, seq) {
  const e = makeEnv();
  e.click({ dataset: { who } }); e.click({ id: 'b-next' });
  for (let r = 0; r < seq.length; r++) {
    const av = available(e.app);
    if (av.out.indexOf(seq[r]) < 0) throw new Error('choice not available ' + seq[r]);
    e.click({ dataset: { id: seq[r] } });
    e.click({ id: 'b-next' });
  }
  return e;
}

const meta = makeEnv().D;
const summary = [];
meta.order.forEach(who => {
  const P = meta.people[who];
  const realEnd = (function () {
    const last = P.rounds[3]; let id = P.realPath[3], end = null;
    Object.keys(last).forEach(k => { if (last[k].choices) last[k].choices.forEach(c => { if (c.id === id) end = c.end; }); });
    return end;
  })();
  let paths = 0, onReal = 0, overlap = 0;
  const stack = [[]];
  while (stack.length) {
    const seq = stack.pop();
    let e;
    try { e = replay(who, seq); } catch (x) { problems.push(who + ' ' + seq.join('>') + ': ' + x.message); continue; }
    const s = e.state();
    if (seq.length === 4) {
      // after the 4th pick b-next moves to the fate screen
      paths++;
      if (s.phase !== 'end') problems.push(who + ' ' + seq.join('>') + ': did not reach fate screen');
      if (!e.D.endings[s.st.end]) problems.push(who + ' ' + seq.join('>') + ': unknown ending ' + s.st.end);
      if (s.st.end === realEnd) onReal++;
      if (seq.every((id, i) => id === P.realPath[i])) overlap++;
      const html = e.app.innerHTML;
      if (/undefined|\{money\}|NaN|\[object/.test(html)) problems.push(who + ' ' + seq.join('>') + ': leftover token in fate screen');
      if (s.st.money < 0) problems.push(who + ' ' + seq.join('>') + ': negative money');
      s.st.pulls.forEach(p => { if (!e.D.kinds[p.kind]) problems.push('bad pull kind ' + p.kind); });
      continue;
    }
    // we are at the start of round seq.length, choices visible
    const av = available(e.app);
    if (!av.out.length) { problems.push(who + ' ' + seq.join('>') + ': no available choice at round ' + (seq.length + 1)); continue; }
    if (/undefined|\{money\}|NaN|\[object/.test(e.app.innerHTML)) problems.push(who + ' ' + seq.join('>') + ': leftover token at round ' + (seq.length + 1));
    if (av.all.length > 1) av.out.forEach(id => { if (id !== P.realPath[seq.length]) { /* needs a pull unless the scene has one option */
      const sc = JSON.stringify(P.rounds[seq.length]); const m = new RegExp("id: '" + id + "'"); 
      let has = false; Object.keys(P.rounds[seq.length]).forEach(k => { const v = P.rounds[seq.length][k]; if (v && v.choices) v.choices.forEach(c => { if (c.id === id && (c.pull || c.end)) has = true; }); });
      if (!has) warn.add(who + ' r' + (seq.length + 1) + ' ' + id);
    } });
    av.out.forEach(id => stack.push(seq.concat(id)));
  }
  // real path must be playable
  try { const e = replay(who, P.realPath); if (e.state().phase !== 'end') problems.push(who + ': real path does not finish'); }
  catch (x) { problems.push(who + ' real path: ' + x.message); }
  summary.push(who.padEnd(8) + ' paths ' + String(paths).padStart(4) + '   on real ending ' + String(onReal).padStart(4) + ' (' + Math.round(100 * onReal / paths) + ' %)   exact real path ' + overlap);
});

console.log(summary.join('\n'));
if (warn.size) console.log('\nChoices without a "pull" (not on the real path, not an ending):\n  ' + Array.from(warn).sort().join('\n  '));
if (problems.length) { console.log('\nPROBLEMS (' + problems.length + '):\n  ' + problems.slice(0, 40).join('\n  ')); process.exit(1); }
console.log('\nAll paths OK.'); process.exit(0);
