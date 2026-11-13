/* Katrina simulation · player logic. All texts live in data.js. */
(function () {
'use strict';
var D = window.KATRINA;
var app = document.getElementById('app');
var S, hist, timers, tick = null;

/* ---------- helpers ---------- */
function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function usd(n) { return '$' + Math.max(0, Math.round(n)).toLocaleString('en-US'); }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function P() { return D.people[S.who]; }
function fill(t) { return esc(t).replace(/\{money\}/g, S && S.st ? usd(S.st.money || 0) : ''); }
function txt(h) { return typeof h === 'string' ? h : h.t; }
function tag(kind) { return (kind && kind !== 'real' && kind !== 'game') ? '<span class="tag ' + esc(kind) + '">' + esc(D.kinds[kind] || kind) + '</span>' : ''; }
function media(key) { return D.media[key] || null; }
function locLabel(loc) { var p = P(); return (p.locLabels && p.locLabels[loc]) || (D.locations[loc] ? D.locations[loc].label : loc); }

/* ---------- scene lookup ---------- */
function sceneFor(r, loc) {
  var rd = P().rounds[r];
  var s = rd[loc] || rd['*'];
  if (!s) { for (var k in rd) { if (k.charAt(0) !== '_') { s = rd[k]; break; } } }
  var card = s.card !== undefined ? s.card : rd._card;
  return { s: s, card: card || null };
}
function scene() { return sceneFor(S.r, S.st.sceneLoc); }

function effChoices() {
  var sc = scene(), st = S.st, p = P();
  var mods = (sc.card && sc.card.mods) || [];
  return sc.s.choices.map(function (c) {
    var e = Object.assign({}, c), base = c.cost || 0, note = '';
    mods.forEach(function (m) { if (m.choice === c.id) { if (m.cost) { e.cost = base + m.cost; note = m.note || 'Costs more'; } if (m.lock) { e.lock = m.lock; e.lockKind = 'game'; } } });
    e.baseCost = base; e.modNote = note;
    if (!e.lock && e.minStrength && st.strength < e.minStrength) { e.lock = e.weakLock || 'You are too weak for this'; e.lockKind = 'game'; e.weak = true; }
    if (!e.lock && p.track.money && (e.cost || 0) > st.money) { e.lock = 'Not enough money'; e.lockKind = 'game'; e.poor = true; }
    return e;
  });
}

/* ---------- state changes ---------- */
function push() { hist.push(clone(S)); }
function applyEffects(o, log) {
  var st = S.st, p = P();
  if (o.food && p.track.food) { st.food = Math.max(0, st.food + o.food); log && log.push((o.food > 0 ? '+' : '') + o.food + ' days of food'); }
  if (o.ethel && p.track.ethel) { var b = st.ethel; st.ethel = clamp(st.ethel + o.ethel, 0, 3); if (st.ethel < b && log) log.push('Ethel: ' + D.ethelLabels[st.ethel]); }
  if (o.strength) { var s0 = st.strength; st.strength = clamp(st.strength + o.strength, 0, 5); if (st.strength !== s0 && log) log.push('Strength: ' + D.strengthLabels[st.strength]); }
}
function seeRumours(list) {
  (list || []).forEach(function (h) { if (typeof h === 'object' && h.false) S.st.seenFalse[h.t] = h.false; });
}
function roundEnd(i) {
  var st = S.st, p = P(), L = D.locations[st.loc] || {}, R = D.rounds[i];
  if (L.inCity && p.track.food) {
    st.food = Math.max(0, st.food - 1);
    if (st.food <= 0) { st.stats.hungry += R.days; st.strength = clamp(st.strength - 1, 0, 5); }
  }
  if (L.strain) st.strength = clamp(st.strength - L.strain, 0, 5);
  if (L.inCity && st.loc !== 'home') st.stats.nights += R.nights;
  if (S.who === 'mayor') st.stats.nights += R.nights;
}
function enterRound(i) {
  push();
  if (i > 0) roundEnd(i - 1);
  S.r = i; S.phase = 'round';
  S.st.sceneLoc = S.st.loc;
  var sc = scene();
  S.st.cardLog = [];
  if (sc.card) applyEffects(sc.card, S.st.cardLog);
  seeRumours(D.rounds[i].ticker); seeRumours(sc.s.hear);
  timers[i] = D.meta.timerSeconds;
  go();
}
function pick(id) {
  var st = S.st;
  if (st.picks.length > S.r) return;
  var c = effChoices().filter(function (x) { return x.id === id; })[0];
  if (!c || c.lock) return;
  push();
  var log = [];
  if (P().track.money && c.cost) { st.money = Math.max(0, st.money - c.cost); log.push('−' + usd(c.cost)); }
  applyEffects(c, log);
  if (c.loc && c.loc !== st.loc) { st.loc = c.loc; log.push(locLabel(c.loc)); }
  if (c.wait) st.stats.wait += c.wait;
  var pl = null;
  if (c.pull && c.id !== P().realPath[S.r]) {
    pl = { t: c.pull.t, kind: c.pull.kind || 'game', lens: c.pull.lens || null };
    if (c.pull.strength) applyEffects({ strength: c.pull.strength }, log);
    st.pulls.push({ r: S.r, t: pl.t, kind: pl.kind, lens: pl.lens });
  }
  if (c.end) st.end = c.end;
  st.picks.push(c.id); st.labels.push(c.t);
  st.log.push({ c: c.c ? fill(c.c) : (c.end ? 'Your choice is made. You will see your fate at the end.' : ''), img: c.img || null, pull: pl, delta: log });
  stopTimer();
  render();
}
function back() {
  if (!hist.length) { reset(); return; }
  S = hist.pop();
  go();
}
function finish() { push(); roundEnd(D.rounds.length - 1); S.phase = 'end'; go(); }
function choose(k) {
  var p = D.people[k];
  hist = []; timers = {};
  S = { who: k, phase: 'intro', r: -1, st: Object.assign({ money: 0, food: 0, ethel: 3, strength: 5, picks: [], labels: [], log: [], pulls: [], end: null, seenFalse: {}, stats: { hungry: 0, nights: 0, wait: 0 } }, clone(p.start)) };
  S.st.sceneLoc = S.st.loc;
  go();
}
function reset() { stopTimer(); Sound.stop(); hist = []; timers = {}; S = { who: null, phase: 'choose' }; go(); }
function go() { window.scrollTo(0, 0); render(); }

/* ---------- timer ---------- */
function stopTimer() { if (tick) { clearInterval(tick); tick = null; } }
function startTimer() {
  stopTimer();
  if (S.phase !== 'round' || S.st.picks.length > S.r) return;
  if (timers.paused || timers[S.r] <= 0) { drawTimer(); return; }
  tick = setInterval(function () {
    timers[S.r] = Math.max(0, timers[S.r] - 1);
    drawTimer();
    if (timers[S.r] <= 0) stopTimer();
  }, 1000);
  drawTimer();
}
function drawTimer() {
  var el = document.getElementById('timer'); if (!el) return;
  var left = timers[S.r], tot = D.meta.timerSeconds;
  el.className = 'timer' + (left <= 10 ? ' low' : '');
  el.querySelector('.bar i').style.width = (100 * left / tot) + '%';
  el.querySelector('.s').textContent = left + ' s';
  var pb = document.getElementById('pause');
  if (pb) { pb.textContent = timers.paused ? 'Resume' : 'Pause'; pb.setAttribute('aria-pressed', timers.paused ? 'true' : 'false'); }
  var up = document.getElementById('timeup');
  if (up) up.hidden = left > 0;
}

/* ---------- pieces ---------- */
function chips() {
  var p = P(), st = S.st, out = [];
  if (p.fixedChips) p.fixedChips.forEach(function (c) { out.push('<span class="chip' + (c.bad ? ' bad' : '') + '">' + esc(c.t) + '</span>'); });
  if (p.track.money) out.push('<span class="chip' + (st.money < 50 ? ' bad' : '') + '">' + usd(st.money) + '</span>');
  if (p.track.food) out.push('<span class="chip' + (st.food <= 0 ? ' bad' : '') + '">Food ' + st.food + (st.food === 1 ? ' day' : ' days') + '</span>');
  var m = ''; for (var i = 1; i <= 5; i++) m += '<i class="' + (i <= st.strength ? 'f' : '') + '"></i>';
  out.push('<span class="chip' + (st.strength <= 1 ? ' bad' : '') + '" title="Strength ' + st.strength + ' of 5">Strength: ' + esc(D.strengthLabels[st.strength]) + '<span class="meter" aria-hidden="true">' + m + '</span></span>');
  if (p.track.ethel) out.push('<span class="chip' + (st.ethel <= 1 ? ' bad' : '') + '">Ethel ' + esc(D.ethelLabels[st.ethel]) + '</span>');
  if (p.carChip) out.push('<span class="chip' + (p.carChip.bad ? ' bad' : '') + '">' + esc(p.carChip.t) + '</span>');
  if (S.phase !== 'intro') out.push('<span class="chip">' + esc(locLabel(S.phase === 'round' ? S.st.sceneLoc : S.st.loc)) + '</span>');
  return '<div class="chips">' + out.join('') + '</div>';
}
function topbar(title, sub) {
  var p = S.who ? P() : null, dots = '';
  D.rounds.forEach(function (x, i) { dots += '<i class="' + (S.phase === 'end' || i < S.r ? 'done' : i === S.r ? 'on' : '') + '" title="Round ' + (i + 1) + '"></i>'; });
  var snd = (S.phase === 'round' && D.rounds[S.r].sound) ? '<button class="iconbtn" id="snd" aria-pressed="' + (Sound.on ? 'true' : 'false') + '">' + (Sound.on ? '🔊 Sound on' : '🔈 Sound off') + '</button>' : '';
  return '<header class="top" style="border-top-color:' + (p ? p.color : 'var(--g)') + '"><div class="row"><h1>' + esc(title) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</h1>' + snd + '<div class="dots" aria-label="Progress">' + dots + '</div></div></header>';
}
function heroHtml(R) {
  var m = media(R.media), v = '';
  if (m.video) v = '<video muted autoplay loop playsinline preload="metadata" poster="' + esc(m.src) + '"><source src="' + esc(m.video) + '" type="video/mp4"></video>';
  return '<section class="hero" style="background-image:url(\'' + esc(m.src) + '\')">' + v +
    '<div class="in"><div class="day">Round ' + R.n + ' · ' + esc(R.when) + '</div><h2>' + esc(R.ask) + '</h2></div><span class="credit">' + esc(m.credit) + '</span></section>';
}
function tickerHtml(R) {
  var items = R.ticker.map(function (h) { return '<span>' + esc(txt(h)) + '</span>'; }).join('');
  return '<div class="ticker" role="marquee" aria-label="Breaking news"><span class="lab">Breaking</span><div class="track">' + items + items + '</div></div>';
}
function figure(key) {
  var m = media(key); if (!m) return '';
  return '<figure><img src="' + esc(m.src) + '" alt="" loading="lazy"><span class="credit">' + esc(m.credit) + '</span></figure>';
}
function nav(left, right) { return '<nav class="nav"><div class="row">' + left + right + '</div></nav>'; }

/* ---------- screens ---------- */
function renderChoose() {
  var btns = D.order.map(function (k) {
    var p = D.people[k];
    return '<button class="pp" data-who="' + k + '" style="background:' + p.color + '"><b>' + esc(p.name) + '</b><small>' + esc(p.sub) + '</small>' + (p.composite ? '<span class="badge">Composite</span>' : '') + '</button>';
  }).join('');
  var m = media('title');
  app.innerHTML = '<div class="start"><div class="pic" style="background-image:url(\'' + esc(m.src) + '\')"><span class="credit">' + esc(m.credit) + '</span></div>' +
    '<div class="txt"><div class="eyebrow">' + esc(D.meta.eyebrow) + '</div><h1>Who are you?</h1><p>' + esc(D.meta.instruction) + '</p>' +
    '<div class="people">' + btns + '</div><p class="small">' + esc(D.meta.gameValues) + ' The Lakeview homeowner is a composite based on neighbourhood data.</p></div></div>';
}
function renderIntro() {
  var p = P();
  var lim = p.constraints.map(function (c) { return '<li><span>' + esc(c.t) + '</span>' + tag(c.kind) + '</li>'; }).join('');
  app.innerHTML = topbar('Your person', p.composite ? 'Composite person' : '') +
    '<div class="wrap"><div class="card"><div class="hd" style="background:' + p.color + '"><b>' + esc(p.name) + '</b><small>' + esc(p.sub) + '</small></div>' + chips() +
    '<div class="intro-text">' + esc(p.intro) + '</div>' +
    '<div class="pad"><h4>Your constraints</h4><ul class="lim">' + lim + '</ul></div>' +
    '<p class="note">' + esc(D.meta.gameValues) + ' Every round you spend in the city uses up a day of food. Heat, waiting and water cost strength.</p></div></div>' +
    nav('<button class="btn ghost" id="b-back">‹ Change person</button>', '<button class="btn grow" id="b-next">Start round 1 ›</button>');
}
function renderRound() {
  var p = P(), R = D.rounds[S.r], sc = scene(), st = S.st;
  var done = st.picks.length > S.r, pk = done ? st.picks[S.r] : null, lg = done ? st.log[S.r] : null;
  var hear = (sc.s.hear || []).length ? '<div class="hear"><h4>What you hear</h4><ul>' + sc.s.hear.map(function (h) { return '<li>' + esc(txt(h)) + '</li>'; }).join('') + '</ul></div>' : '';
  var card = '';
  if (sc.card) {
    var eff = (st.cardLog || []).slice();
    (sc.card.mods || []).forEach(function (m) { if (sc.s.choices.some(function (c) { return c.id === m.choice; })) eff.push(m.note + (m.cost ? ': +' + usd(m.cost) : '')); });
    card = '<div class="cplx"><h4>Complication ' + tag(sc.card.kind || 'game') + '</h4><p>' + fill(sc.card.t) + '</p>' + (eff.length ? '<div class="eff">' + esc(eff.join(' · ')) + '</div>' : '') + '</div>';
  }
  var opts = effChoices().map(function (c, j) {
    var cls = done ? (pk === c.id ? 'picked' : 'faded') : (c.lock ? 'locked' : '');
    var price = c.cost ? '<span class="p">' + (c.modNote ? '<s>' + usd(c.baseCost) + '</s>' : '') + usd(c.cost) + '</span>' : '';
    var lk = c.lock ? '<em>' + esc(c.lock) + (c.poor ? '' : tag(c.lockKind || 'game')) + '</em>' : '';
    return '<button class="opt ' + cls + '" data-id="' + esc(c.id) + '"' + (c.lock || done ? ' disabled aria-disabled="true"' : '') + '><span class="k">' + 'ABCDEF'[j] + '</span><span class="l">' + esc(c.t) + lk + '</span>' + price + '</button>';
  }).join('');
  var timer = done ? '' : '<div class="timer" id="timer"><div class="bar"><i></i></div><span class="s"></span><button class="iconbtn" id="pause" aria-pressed="false">Pause</button></div><div class="timeup" id="timeup" hidden>' + esc(D.meta.timeUp) + '</div>';
  var cons = done ? '<div class="cons"><span class="what">What happens to you</span>' + lg.c +
    (lg.delta.length ? '<div class="delta">' + lg.delta.map(function (d) { return '<span' + (/^\+/.test(d) ? ' class="up"' : '') + '>' + esc(d) + '</span>'; }).join('') + '</div>' : '') +
    (lg.pull ? '<div class="pull"><span class="what">Reality check' + (lg.pull.lens ? ' · ' + esc(D.lens[lg.pull.lens]) : '') + '</span>' + fill(lg.pull.t) + '</div>' : '') +
    (lg.img ? figure(lg.img) : '') + '</div><div class="wait">' + esc(D.meta.waitBox) + '</div>' : '';
  var last = S.r === D.rounds.length - 1;
  app.innerHTML = topbar(p.name, 'Round ' + R.n + ' of ' + D.rounds.length + (p.composite ? ' · Composite' : '')) + tickerHtml(R) + heroHtml(R) +
    '<div class="wrap"><div class="card">' + chips() + '<div class="sit">' + fill(sc.s.sit) + '</div>' + hear + card + timer +
    '<div class="choices" role="group" aria-label="Your choices">' + opts + '</div>' + cons + '</div></div>' +
    nav('<button class="btn ghost" id="b-back">‹ Back</button>', '<button class="btn grow" id="b-next"' + (done ? '' : ' disabled') + '>' + (last ? 'See your fate ›' : 'Start round ' + (S.r + 2) + ' ›') + '</button>');
  if (!done) startTimer();
  if (done) { var w = app.querySelector('.cons'); if (w && w.scrollIntoView) w.scrollIntoView({ block: 'center' }); }
  if (R.sound && Sound.on) Sound.play(); else Sound.stop();
}
function endingText() {
  var p = P(), st = S.st, L = D.endLines, e = D.endings[st.end] || { t: '' }, x = [fill(e.t)];
  if (S.who === 'mayor') {
    var first = p.rounds[0]['*'].choices.filter(function (c) { return c.id === st.picks[0]; })[0];
    if (first && first.legacy) x.push(esc(first.legacy));
    if (st.strength <= 2) x.push(esc(L.mayorWeak));
    return x.join(' ');
  }
  if (p.track.money) x.push(fill(st.money < 150 ? L.moneyLow : st.money < 1000 ? L.moneyMid : L.moneyHigh));
  if (p.track.food && (st.food <= 0 || st.stats.hungry > 0)) x.push(esc(L.hungry));
  if (st.strength <= 1) x.push(esc(L.weak));
  if (p.track.ethel) x.push(esc(st.end === 'h_wait' && st.loc === 'cc' ? L.ethelDeath : L.ethel[st.ethel]));
  return x.join(' ');
}
function renderEnd() {
  var p = P(), st = S.st, e = D.endings[st.end] || {};
  var same = p.realPath.every(function (v, i) { return st.picks[i] === v; });
  var hits = p.realPath.filter(function (v, i) { return st.picks[i] === v; }).length;
  var path = st.labels.map(function (l, i) { return '<li><b>Round ' + (i + 1) + '</b><span>' + esc(l) + '</span>' + (st.picks[i] === p.realPath[i] ? '<span class="m">= real</span>' : '') + '</li>'; }).join('');
  var g = [];
  if (S.who === 'mayor') {
    g.push(['Nights with little sleep', st.stats.nights]);
    g.push(['Strength at the end', D.strengthLabels[st.strength]]);
  } else {
    if (p.track.food) g.push(['Days without enough food (game)', st.stats.hungry]);
    g.push(['Nights away from home in the flooded city', st.stats.nights]);
    g.push(['Hours of waiting (game estimate)', st.stats.wait]);
    if (p.track.money) g.push(['Money left', usd(st.money)]);
    g.push(['Strength at the end', D.strengthLabels[st.strength]]);
    if (p.track.ethel) g.push(['Ethel', st.end === 'h_wait' && st.loc === 'cc' ? 'died' : D.ethelLabels[st.ethel]]);
    g.push(['Where you end up', e.where || locLabel(st.loc)]);
  }
  var mine = g.map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('');
  var real = p.realStats.map(function (r) { return '<dt>' + esc(r.label) + '</dt><dd>' + esc(r.value) + '</dd>'; }).join('');
  var rum = Object.keys(st.seenFalse).map(function (k) { return '<li><span class="tag rumour">Rumour</span> <q>' + esc(k.replace(/^[^:]+:\s*/, '').replace(/[“”]/g, '')) + '</q><div>' + esc(st.seenFalse[k]) + '</div></li>'; }).join('');
  var who = p.firstName || p.name;
  var pulls = st.pulls.map(function (x) { return '<li><b>Round ' + (x.r + 1) + '</b><span>' + fill(x.t) + '</span>' + (x.lens ? '<em class="lensname">' + esc(D.lens[x.lens]) + '</em>' : '') + '</li>'; }).join('');
  var lc = { intentional: 0, structural: 0, class: 0 }; st.pulls.forEach(function (x) { if (x.lens) lc[x.lens]++; });
  var lensBox = '<div class="pad"><h4>Through our lens</h4>' + (st.pulls.length ? '<p class="lensrow">' + Object.keys(lc).map(function (k) { return esc(D.lens[k]) + ' <b>' + lc[k] + '</b>'; }).join(' · ') + '</p>' : '') + (p.lensNote ? '<p>' + esc(p.lensNote) + '</p>' : '') + '</div>';
  app.innerHTML = topbar('Your fate', p.name + (p.composite ? ' · Composite' : '')) +
    '<div class="wrap"><div class="card"><div class="hd" style="background:' + p.color + '"><b>' + esc(p.name) + '</b><small>' + esc(p.sub) + '</small></div>' + chips() +
    '<div class="pad"><h4>Your path</h4><ol class="path">' + path + '</ol></div>' +
    '<div class="pad"><h4>Your ending</h4><div class="end">' + endingText() + '</div>' +
    (e.img ? '<div class="endimg">' + figure(e.img) + '</div>' : '') +
    '<span class="match ' + (same ? 'yes' : 'no') + '">' + (same ? 'Your path matches what really happened' : 'Your path differs from what really happened' + (hits ? ' (same in ' + hits + ' of 4 rounds)' : '')) + '</span></div>' +
    (pulls ? '<div class="pad"><h4>What pushed against your choices</h4><ul class="pulls">' + pulls + '</ul></div>' : '') +
    lensBox +
    '<div class="pad"><h4>How hard was it?</h4><div class="hard"><div class="col"><h4>In your game</h4><dl>' + mine + '</dl></div><div class="col"><h4>In reality' + (p.composite ? ' (composite)' : '') + '</h4><dl>' + real + '</dl></div></div></div>' +
    '<div class="pad"><h4>What really happened to ' + esc(who) + (p.composite ? ' <span class="tag composite">Composite</span>' : '') + '</h4></div><div class="realbox">' + esc(p.real) + '</div>' +
    (rum ? '<div class="pad"><h4>What you heard that turned out false</h4><ul class="rumours">' + rum + '</ul></div>' : '') +
    '</div><div class="q">' + esc(D.meta.question) + '</div><p class="sources">' + esc(D.meta.sources) + '</p></div>' +
    nav('<button class="btn ghost" id="b-back">‹ Back</button>', '<button class="btn grow" id="b-again">Play again</button>');
}
function render() {
  stopTimer();
  if (S.phase === 'choose') renderChoose();
  else if (S.phase === 'intro') renderIntro();
  else if (S.phase === 'round') renderRound();
  else renderEnd();
  if (S.phase !== 'round') Sound.stop();
}

/* ---------- events ---------- */
app.addEventListener('click', function (ev) {
  var b = ev.target.closest('button'); if (!b || b.disabled) return;
  if (b.dataset.who) return choose(b.dataset.who);
  if (b.dataset.id) return pick(b.dataset.id);
  if (b.id === 'b-back') { if (S.phase === 'intro') return reset(); return back(); }
  if (b.id === 'b-next') { if (S.phase === 'intro') return enterRound(0); if (S.r === D.rounds.length - 1) return finish(); return enterRound(S.r + 1); }
  if (b.id === 'b-again') return reset();
  if (b.id === 'pause') { timers.paused = !timers.paused; startTimer(); return; }
  if (b.id === 'snd') { Sound.toggle(); render(); return; }
});

window.KatrinaApp = { state: function () { return S; } };
reset();
})();
