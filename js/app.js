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
var lastChips = {};
function vib(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }
var ICON = {
  pause: '<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" rx="1"/><rect x="7" y="1.5" width="3" height="9" rx="1"/></svg>',
  play: '<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z"/></svg>',
  lock: '<svg viewBox="0 0 16 16" width="17" height="17" aria-hidden="true"><path d="M4.5 7V5a3.5 3.5 0 0 1 7 0v2h.5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zm1.6 0h3.8V5a1.9 1.9 0 0 0-3.8 0z"/></svg>'
};
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
  if (o.ethel && p.track.ethel) { var b = st.ethel; st.ethel = clamp(st.ethel + o.ethel, 0, 3); if (st.ethel < b && log) log.push('Ethel: ' + D.ethelLabels[st.ethel]); if (st.ethel === 0 && b > 0) addBurden('Ethel is in critical condition'); }
  if (o.strength) { var s0 = st.strength; st.strength = clamp(st.strength + o.strength, 0, 5); if (st.strength !== s0 && log) log.push('Strength: ' + D.strengthLabels[st.strength]); }
}
function addBurden(t) {
  var b = S.st.burdens; if (!b) b = S.st.burdens = [];
  t = String(t).replace(/\{money\}/g, usd(S.st.money || 0));
  if (b.indexOf(t) < 0) b.push(t);
}
function seeRumours(list) {
  (list || []).forEach(function (h) { if (typeof h === 'object' && h.false) S.st.seenFalse[h.t] = h.false; });
}
function roundEnd(i) {
  var st = S.st, p = P(), L = D.locations[st.loc] || {}, R = D.rounds[i];
  if (L.inCity && p.track.food) {
    st.food = Math.max(0, st.food - 1);
    if (st.food <= 0) { st.stats.hungry += R.days; st.strength = clamp(st.strength - 1, 0, 5); addBurden('No food or clean water left'); }
  }
  if (L.strain) st.strength = clamp(st.strength - L.strain, 0, 5);
  if (L.inCity && st.loc !== 'home') st.stats.nights += R.nights;
  if (S.who === 'mayor') st.stats.nights += R.nights;
  if (st.strength <= 1) addBurden('Your body is close to collapse');
}
function enterRound(i) {
  push();
  if (i > 0) roundEnd(i - 1);
  S.r = i; S.phase = 'round';
  S.st.sceneLoc = S.st.loc;
  var sc = scene();
  S.st.cardLog = [];
  if (sc.card) { applyEffects(sc.card, S.st.cardLog); addBurden(sc.card.t); }
  if (S.st.sceneLoc === 'dome' && D.rounds[i].dome) D.rounds[i].dome.forEach(addBurden);
  effChoices().forEach(function (c) { if (c.lock) addBurden(c.poor ? 'Could not afford: ' + c.t + ' (' + usd(c.cost) + ')' : 'Not possible: ' + c.t + '. ' + c.lock); });
  seeRumours(D.rounds[i].ticker); seeRumours(sc.s.hear);
  timers[i] = D.meta.timerSeconds;
  go();
}
function pick(id) {
  var st = S.st;
  if (st.picks.length > S.r) return;
  var all = effChoices(), c = all.filter(function (x) { return x.id === id; })[0];
  if (!c || c.lock) return;
  push();
  var closed = all.filter(function (x) { return x.lock; }).map(function (x) { return { t: x.t, why: x.lock }; });
  var log = [], prevLoc = st.loc;
  if (P().track.money && c.cost) { st.money = Math.max(0, st.money - c.cost); log.push('−' + usd(c.cost)); }
  applyEffects(c, log);
  if (c.loc && c.loc !== st.loc) { st.loc = c.loc; log.push(locLabel(c.loc)); }
  var sp = c.surprise || null;
  if (sp) {
    if (P().track.money && sp.cost) { st.money = Math.max(0, st.money - sp.cost); log.push('−' + usd(sp.cost)); }
    applyEffects(sp, log);
    if (sp.loc && sp.loc !== st.loc) { st.loc = sp.loc; log.push(locLabel(sp.loc)); }
    if (sp.wait) st.stats.wait += sp.wait;
    addBurden(sp.t);
  }
  var leaving = (st.loc === 'out' && prevLoc !== 'out' && P().leaving) ? P().leaving : null;
  if (leaving) leaving.forEach(function (x) { addBurden(x.t); });
  if (c.wait) st.stats.wait += c.wait;
  var pl = null;
  if (c.pull && c.id !== P().realPath[S.r]) {
    pl = { t: c.pull.t, kind: c.pull.kind || 'game', lens: c.pull.lens || null };
    if (c.pull.strength) applyEffects({ strength: c.pull.strength }, log);
    st.pulls.push({ r: S.r, t: pl.t, kind: pl.kind, lens: pl.lens });
  }
  if (c.end) st.end = c.end;
  st.picks.push(c.id); st.labels.push(c.t);
  st.log.push({ c: c.c ? fill(c.c) : (c.end ? 'Your choice is made. You will see your fate at the end.' : ''), img: c.img || null, pull: pl, delta: log, leaving: !!leaving, surprise: sp ? sp.t : null, closed: closed, total: all.length });
  stopTimer();
  vib(15);
  app.className = 'stay';
  render();
}
function knock(b) {
  S.st.knocks = (S.st.knocks || 0) + 1;
  b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
  vib(60);
}
function back() {
  if (!hist.length) { reset(); return; }
  S = hist.pop();
  go();
}
function finish() { push(); roundEnd(D.rounds.length - 1); S.phase = 'end'; go(); }
function choose(k) {
  var p = D.people[k];
  hist = []; timers = {}; lastChips = {};
  S = { who: k, phase: 'intro', r: -1, st: Object.assign({ money: 0, food: 0, ethel: 3, strength: 5, picks: [], labels: [], log: [], pulls: [], burdens: [], reasons: {}, felt: {}, guess: {}, end: null, seenFalse: {}, stats: { hungry: 0, nights: 0, wait: 0 } }, clone(p.start)) };
  S.st.sceneLoc = S.st.loc;
  go();
}
function reset() { stopTimer(); Sound.stop(); hist = []; timers = {}; S = { who: null, phase: 'choose' }; go(); }
function go() { app.className = 'enter'; window.scrollTo(0, 0); render(); }

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
  var left = timers[S.r], tot = D.meta.timerSeconds, C = 81.68;
  el.className = 'tpill' + (left <= 10 ? ' low' : '') + (timers.paused ? ' paused' : '');
  el.querySelector('.tv').style.strokeDashoffset = C * (1 - left / tot);
  el.querySelector('.s').textContent = Math.floor(left / 60) + ':' + ('0' + left % 60).slice(-2);
  var pb = document.getElementById('pause');
  if (pb) { pb.innerHTML = timers.paused ? ICON.play : ICON.pause; pb.setAttribute('aria-pressed', timers.paused ? 'true' : 'false'); pb.setAttribute('aria-label', timers.paused ? 'Resume timer' : 'Pause timer'); }
  var up = document.getElementById('timeup');
  if (up) up.hidden = left > 0;
  if (left <= 0 && !timers['buzz' + S.r]) { timers['buzz' + S.r] = 1; vib([120, 80, 120]); }
}

/* ---------- pieces ---------- */
function chips() {
  var p = P(), st = S.st, out = [];
  function add(key, text, bad, extra) {
    var changed = lastChips[key] != null && lastChips[key] !== text;
    lastChips[key] = text;
    out.push('<span class="chip' + (bad ? ' bad' : '') + (changed ? ' flash' : '') + '">' + esc(text) + (extra || '') + '</span>');
  }
  if (p.fixedChips) p.fixedChips.forEach(function (c, i) { add('fx' + i, c.t, c.bad); });
  if (p.track.money) add('money', usd(st.money), st.money < 50);
  if (p.track.food) add('food', 'Food ' + st.food + (st.food === 1 ? ' day' : ' days'), st.food <= 0);
  var m = ''; for (var i = 1; i <= 5; i++) m += '<i class="' + (i <= st.strength ? 'f' : '') + '"></i>';
  add('strength', 'Strength: ' + D.strengthLabels[st.strength], st.strength <= 1, '<span class="meter" aria-hidden="true">' + m + '</span>');
  if (p.track.ethel) add('ethel', 'Ethel ' + D.ethelLabels[st.ethel], st.ethel <= 1);
  if (p.carChip) add('car', p.carChip.t, p.carChip.bad);
  if (S.phase !== 'intro') add('loc', locLabel(S.phase === 'round' ? S.st.sceneLoc : S.st.loc), false);
  return '<div class="chips">' + out.join('') + '</div>';
}
function topbar(title, sub) {
  var p = S.who ? P() : null, live = S.phase === 'round' && S.st.picks.length <= S.r;
  var steps = D.rounds.map(function (x, i) {
    var c = (S.phase === 'end' || i < S.r) ? 'done' : i === S.r ? 'on' : '';
    return '<li class="' + c + '"><i></i><span>' + esc(x.short) + '</span></li>';
  }).join('') + '<li class="' + (S.phase === 'end' ? 'on' : '') + '"><i></i><span>Fate</span></li>';
  var tm = live ? '<div class="tpill" id="timer"><svg viewBox="0 0 32 32" aria-hidden="true"><circle class="tr" cx="16" cy="16" r="13"/><circle class="tv" cx="16" cy="16" r="13"/></svg><span class="s"></span><button class="tbtn" id="pause" aria-pressed="false" aria-label="Pause timer">' + ICON.pause + '</button></div>' : '';
  return '<header class="top" style="border-top-color:' + (p ? p.color : 'var(--g)') + '"><div class="row"><h1>' + esc(title) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</h1>' + tm + '</div><ol class="tl" aria-label="Progress">' + steps + '</ol></header>';
}
function heroHtml(R) {
  var m = media(R.media), v = '', L = D.locations[S.st.sceneLoc] || {};
  if (m.video) v = '<video muted autoplay loop playsinline preload="metadata" poster="' + esc(m.src) + '"><source src="' + esc(m.video) + '" type="video/mp4"></video>';
  var snd = R.sound ? '<button class="iconbtn snd" id="snd" aria-pressed="' + (Sound.on ? 'true' : 'false') + '">' + (Sound.on ? '🔊 Sound on' : '🔈 Sound off') + '</button>' : '';
  var rain = R.storm ? '<div class="rain" aria-hidden="true"></div>' : '';
  var water = (R.water && (L.inCity || S.who === 'mayor')) ? '<div class="water" aria-hidden="true" style="height:' + R.water + '%"><svg viewBox="0 0 1200 24" preserveAspectRatio="none"><path d="M0 12 Q75 0 150 12 T300 12 T450 12 T600 12 T750 12 T900 12 T1050 12 T1200 12 V24 H0z"/></svg></div>' : '';
  return '<section class="hero" style="background-image:url(\'' + esc(m.src) + '\')">' + v + rain + water + snd +
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
function burdenHtml(open) {
  var b = (S.st && S.st.burdens) || [];
  if (!b.length) return '';
  var items = b.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
  if (open) return '<div class="pad"><h4>Everything you had to deal with · ' + b.length + '</h4><ul class="burdens">' + items + '</ul></div>';
  var grew = lastChips.burden != null && lastChips.burden < b.length; lastChips.burden = b.length;
  return '<details class="burden' + (grew ? ' grew' : '') + '"><summary>Your difficulties so far <b>' + b.length + '</b></summary><ul class="burdens">' + items + '</ul></details>';
}
function domeHtml() {
  var R = D.rounds[S.r];
  if (S.st.sceneLoc !== 'dome' || !R.dome) return '';
  return '<div class="dome"><span class="what">Inside the Superdome</span><ul>' + R.dome.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
}
function leaveHtml() {
  var p = P(); if (!p.leaving) return '';
  return '<div class="leave"><span class="what">Leaving is not the end</span><ul>' + p.leaving.map(function (x) { return '<li>' + fill(x.t) + '</li>'; }).join('') + '</ul></div>';
}
function nav(left, right) { return '<nav class="nav"><div class="row">' + left + right + '</div></nav>'; }

/* ---------- screens ---------- */
function renderChoose() {
  var btns = D.order.map(function (k) {
    var p = D.people[k], pr = p.profile || {}, m = pr.portrait ? media(pr.portrait) : null;
    return '<button class="pp" data-who="' + k + '" style="background:' + p.color + '">' +
      (m ? '<img class="av" src="' + esc(m.src) + '" alt="">' : '<span class="av mono" aria-hidden="true">' + esc(pr.initials || '') + '</span>') +
      '<span class="pt"><b>' + esc(p.name) + '</b><small>' + esc(p.sub) + '</small></span><span class="go" aria-hidden="true">›</span></button>';
  }).join('');
  var m = media('title');
  app.innerHTML = '<div class="start"><div class="pic" style="background-image:url(\'' + esc(m.src) + '\')"><div class="ptxt"><div class="eyebrow">' + esc(D.meta.eyebrow) + '</div><h1>' + esc(D.meta.title) + '</h1></div><span class="credit">' + esc(m.credit) + '</span></div>' +
    '<div class="txt"><h2>Who are you?</h2><p>' + esc(D.meta.instruction) + '</p>' +
    '<div class="people">' + btns + '</div><p class="small">' + esc(D.meta.gameValues) + '</p></div></div>';
}
function profileHtml() {
  var p = P(), pr = p.profile || {}, m = pr.portrait ? media(pr.portrait) : null;
  var pic = m ? '<figure class="portrait"><img src="' + esc(m.src) + '" alt="' + esc(p.name) + '">' + (m.credit ? '<figcaption>' + esc(m.credit) + '</figcaption>' : '') + '</figure>'
              : '<div class="portrait mono" aria-hidden="true"><span>' + esc(pr.initials || '') + '</span><small>Photo to come</small></div>';
  var facts = (pr.facts || []).map(function (f) { return '<div><dt>' + esc(f.label) + '</dt><dd>' + esc(f.value) + '</dd></div>'; }).join('');
  return '<div class="profile" style="background:' + p.color + '">' + pic + '<div class="pinfo"><span class="meet">Meet your person</span><b>' + esc(p.name) + '</b><small>' + esc(p.sub) + '</small>' + (facts ? '<dl>' + facts + '</dl>' : '') + '</div></div>';
}
function renderIntro() {
  var p = P();
  var lim = p.constraints.map(function (c) { return '<li><span>' + esc(c.t) + '</span>' + tag(c.kind) + '</li>'; }).join('');
  app.innerHTML = topbar('Your person', p.composite ? 'Composite person' : '') +
    '<div class="wrap"><ol class="how">' + (D.meta.how || []).map(function (h, i) { return '<li><b>' + (i + 1) + '</b>' + esc(h) + '</li>'; }).join('') + '</ol><div class="card">' + profileHtml() + chips() +
    '<div class="intro-text">' + esc(p.intro) + '</div>' +
    '<div class="pad"><h4>Your constraints</h4><ul class="lim">' + lim + '</ul></div>' +
    '<p class="note">' + esc(D.meta.gameValues) + ' Every round you spend in the city uses up a day of food. Heat, waiting and water cost strength.</p></div>' +
    '</div>' +
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
    return '<button class="opt ' + cls + '" data-id="' + esc(c.id) + '"' + (done ? ' disabled aria-disabled="true"' : c.lock ? ' aria-disabled="true"' : '') + '><span class="k">' + (c.lock && !done ? ICON.lock : 'ABCDEF'[j]) + '</span><span class="l">' + esc(c.t) + lk + '</span>' + price + '</button>';
  }).join('');
  var timer = done ? '' : '<div class="timeup" id="timeup" hidden>' + esc(D.meta.timeUp) + '</div>';
  var cons = done ? '<div class="cons"><span class="what">What happens to you</span>' + lg.c +
    (lg.surprise ? '<div class="surprise"><span class="what">Sudden change · nobody could plan for this</span>' + fill(lg.surprise) + '</div>' : '') +
    (lg.delta.length ? '<div class="delta">' + lg.delta.map(function (d) { return '<span' + (/^\+/.test(d) ? ' class="up"' : '') + '>' + esc(d) + '</span>'; }).join('') + '</div>' : '') +
    (lg.pull ? '<div class="pull"><span class="what">Reality check' + '' + '</span>' + fill(lg.pull.t) + '</div>' : '') +
    (lg.leaving ? leaveHtml() : '') + (lg.img ? figure(lg.img) : '') + '</div>' + '<div class="wait">' + esc(D.meta.waitBox) + '</div>' : '';
  var last = S.r === D.rounds.length - 1;
  app.innerHTML = topbar(p.name, 'Round ' + R.n + ' of ' + D.rounds.length + (p.composite ? ' · Composite' : '')) + tickerHtml(R) + heroHtml(R) +
    '<div class="wrap"><div class="card">' + chips() + burdenHtml(false) + '<div class="sit">' + fill(sc.s.sit) + '</div>' + domeHtml() + hear + card + timer +
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
    return x;
  }
  if (p.track.money && !e.noMoney) x.push(fill(st.money < 150 ? L.moneyLow : st.money < 1000 ? L.moneyMid : L.moneyHigh));
  if (p.track.food && (st.food <= 0 || st.stats.hungry > 0)) x.push(esc(L.hungry));
  if (st.strength <= 1) x.push(esc(L.weak));
  if (p.track.ethel) x.push(esc(st.end === 'h_wait' && st.loc === 'cc' ? L.ethelDeath : L.ethel[st.ethel]));
  return x;
}
function endingHtml() {
  var x = endingText();
  return '<p class="endh">' + x[0] + '</p>' + (x.length > 1 ? '<ul class="endl">' + x.slice(1).map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ul>' : '');
}
function miniHead() {
  var p = P(), pr = p.profile || {}, m = pr.portrait ? media(pr.portrait) : null;
  return '<div class="mini" style="background:' + p.color + '">' + (m ? '<img src="' + esc(m.src) + '" alt="">' : '<span class="mi">' + esc(pr.initials || '') + '</span>') + '<div><b>' + esc(p.name) + '</b><small>' + esc(p.sub) + '</small></div></div>';
}
function renderEnd() {
  var p = P(), st = S.st, e = D.endings[st.end] || {}, who = p.firstName || p.name;
  var known = p.realPath.filter(function (v) { return v; }).length, partial = known < p.realPath.length;
  var same = p.realPath.every(function (v, i) { return !v || st.picks[i] === v; });
  var hits = p.realPath.filter(function (v, i) { return v && st.picks[i] === v; }).length;
  var why = (p.realWhy || []).map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('');
  var cmp = st.labels.map(function (l, i) {
    var R = D.rounds[i], hit = p.realPath[i] && st.picks[i] === p.realPath[i];
    return '<div class="cmp' + (hit ? ' hit' : '') + '"><div class="ch">Round ' + R.n + ' · ' + esc(R.short) + '</div>' +
      '<div class="cy"><span>You</span>' + esc(l) + '</div><div class="cr"><span>' + esc(S.who === 'mayor' ? 'Nagin' : who.split(' ')[0]) + '</span>' + esc(p.realRows[i] || '–') + '</div></div>';
  }).join('');
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
  var b = st.burdens || [];
  app.innerHTML = topbar('Your fate', p.name) +
    '<div class="wrap"><div class="card">' + miniHead() + chips() +
    '<div class="pad"><h4>What really happened to ' + esc(who) + '</h4></div><div class="realbox">' + esc(p.real) + (p.realSource ? '<small class="rsrc">' + esc(p.realSource) + '</small>' : '') + '</div>' +
    (why ? '<div class="pad"><h4>Why ' + esc(who) + ' may have decided this</h4><ul class="why">' + why + '</ul></div>' : '') +
    '<div class="pad"><h4>Your path and the real path</h4>' + cmp + '</div>' +
    '<div class="pad"><h4>Your ending</h4><div class="end">' + endingHtml() + '</div>' + (e.img ? '<div class="endimg">' + figure(e.img) + '</div>' : '') +
    '<span class="match ' + (same ? 'yes' : 'no') + '">' + (same ? (partial ? 'Your path matches what is documented' : 'Your path matches what really happened') : 'Your path differs from what really happened' + (hits ? ' (same in ' + hits + ' of ' + known + ' documented rounds)' : '')) + '</span></div>' +
    '<div class="pad"><h4>How hard was it?</h4><div class="hard"><div class="col"><h4>In your game</h4><dl>' + mine + '</dl></div><div class="col"><h4>In reality</h4><dl>' + real + '</dl></div></div></div>' +
    (p.returning ? '<div class="pad"><h4>Can you come back?</h4><ul class="burdens back">' + p.returning.map(function (x) { return '<li>' + fill(x.t) + '</li>'; }).join('') + '</ul>' + (p.returnFact ? '<p class="retfact">' + esc(p.returnFact) + '</p>' : '') + '</div>' : '') +
    (b.length ? '<div class="pad"><details class="burden all"><summary>Everything you had to deal with <b>' + b.length + '</b></summary><ul class="burdens">' + b.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></details></div>' : '') +
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
document.addEventListener('click', function (ev) {
});
app.addEventListener('click', function (ev) {
  var b = ev.target.closest('button'); if (!b || b.disabled) return;
  if (b.dataset.who) return choose(b.dataset.who);
  if (b.dataset.id) { if (b.classList.contains('locked')) return knock(b); return pick(b.dataset.id); }
  if (b.dataset.felt) { S.st.felt[S.r] = +b.dataset.felt; b.parentNode.querySelectorAll('.sbtn').forEach(function (x) { x.classList.toggle('on', x === b); }); return; }
  if (b.id === 'b-back') { if (S.phase === 'intro') return reset(); return back(); }
  if (b.id === 'b-next') { if (S.phase === 'intro') return enterRound(0); if (S.r === D.rounds.length - 1) return finish(); return enterRound(S.r + 1); }
  if (b.id === 'b-again') return reset();
  if (b.id === 'pause') { timers.paused = !timers.paused; startTimer(); return; }
  if (b.id === 'snd') { Sound.toggle(); app.className = 'stay'; render(); return; }
});

window.KatrinaApp = { state: function () { return S; } };
reset();
})();
