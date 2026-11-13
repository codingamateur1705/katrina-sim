/* Katrina simulation · presenter view for the projector. Arrows, space or clicks move forward and back. */
(function () {
'use strict';
var D = window.KATRINA, stage = document.getElementById('stage');
var slides = [], i = 0, tLeft = 0, tRun = null;
function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function M(k) { return D.media[k]; }
function bg(k, video) {
  var m = M(k), v = (video && m.video) ? '<video muted autoplay loop playsinline poster="' + esc(m.src) + '"><source src="' + esc(m.video) + '" type="video/mp4"></video>' : '';
  return '<div class="bg" style="background-image:url(\'' + esc(m.src) + '\')">' + v + '</div><div class="shade"></div><span class="credit">' + esc(m.credit) + '</span>';
}
var url = D.meta.publicUrl;

/* title */
slides.push({ cls: 'title', notes: 'Groups scan the code, pick the person they were given and read “Your person”. Then start round 1.', html:
  '<div class="content"><div class="l"><div class="eyebrow">' + esc(D.meta.eyebrow) + '</div><h1>' + esc(D.meta.title) + '</h1><p>Scan with one phone per group. Pick the person you were given.</p><div class="seats">' +
  D.order.map(function (k) { var p = D.people[k]; return '<div class="seat" style="background:' + p.color + '"><small>' + esc(p.seat) + '</small><b>' + esc(p.name) + '</b><span>' + esc(p.sub) + '</span></div>'; }).join('') +
  '</div></div><div class="qr"><img src="qr.png" alt="QR code to the simulation"><div>' + esc(url.replace(/^https?:\/\//, '')) + '</div></div></div>' });

/* rounds */
D.rounds.forEach(function (R) {
  var head = '<div class="eyebrow">Round ' + R.n + ' · ' + esc(R.when) + '</div><h2>' + esc(R.ask) + '</h2>';
  slides.push({ timer: true, notes: (R.n === 1 ? 'Each group has ' + D.meta.timerSeconds + ' seconds. Press T or click the timer to start it. ' : 'Press T to start the ' + D.meta.timerSeconds + ' seconds. ') + (R.notes || ''), html:
    bg(R.knowMedia, R.n === 1) + '<div class="content">' + head + '<div class="box"><h3>What you know</h3><ul>' + R.know.map(function (k) { return '<li>' + esc(k) + '</li>'; }).join('') + '</ul></div></div>' });
  slides.push({ notes: R.notes || '', html:
    bg(R.happenedMedia, false) + '<div class="content"><div class="eyebrow">Round ' + R.n + ' · ' + esc(R.short) + '</div><h2>What happened in the city</h2><div class="box red"><h3>' + esc(R.when) + '</h3><ul>' + R.happened.map(function (k) { return '<li>' + esc(k) + '</li>'; }).join('') + '</ul></div></div>' });
});

/* real people table */
var rows = D.order.map(function (k) {
  var p = D.people[k];
  return '<tr><td class="who" style="background:' + p.color + '">' + esc(p.composite ? 'Lakeview homeowner' : (p.fullName ? 'The Mayor' : p.name.replace(/,.*$/, ''))) + '<small>' + esc(p.composite ? 'Composite' : (p.fullName || '')) + '</small></td>' +
    p.realRows.map(function (x) { return '<td>' + esc(x) + '</td>'; }).join('') + '</tr>';
}).join('');
slides.push({ cls: 'tab', notes: 'Groups now open “Your fate” on their phones and compare.', html:
  '<div class="content"><h2>What our four people really did</h2><table><thead><tr><th style="width:17%"></th>' +
  D.rounds.map(function (R) { return '<th>Round ' + R.n + ' · ' + esc(R.short) + '</th>'; }).join('') + '</tr></thead><tbody>' + rows + '</tbody></table>' +
  '<div class="src">Sources. House (2006), pp. 109 to 113; Senate (2006), p. 250; WWL (2005); AP via NBC News (2005, 2006); Lessin and Deal (2008); Horowitz (2020), ch. 4 and 5. The Lakeview story is based on neighbourhood data.</div></div>' });

/* closing */
slides.push({ cls: 'close', notes: '', html: '<div class="content"><div class="eyebrow" style="color:#f6d3d5">Same storm, four fates</div><h1>' + esc(D.meta.question) + '</h1><div class="src">' + esc(D.meta.sources) + '</div></div>' });

/* ---------- show ---------- */
function show(n) {
  i = Math.max(0, Math.min(slides.length - 1, n));
  stopTimer();
  var s = slides[i];
  stage.innerHTML = '<section class="slide ' + (s.cls || '') + '">' + s.html + (s.timer ? '<button class="timer" id="tm" title="Start or pause (T)">' + D.meta.timerSeconds + '<small>seconds</small></button>' : '') + '</section>';
  tLeft = D.meta.timerSeconds;
  document.getElementById('bar').style.width = (100 * (i + 1) / slides.length) + '%';
  document.getElementById('notes').innerHTML = '<b>Notes · slide ' + (i + 1) + ' of ' + slides.length + '</b>' + esc(s.notes || 'No notes.');
  if (location.hash !== '#' + (i + 1)) history.replaceState(null, '', '#' + (i + 1));
}
function stopTimer() { if (tRun) { clearInterval(tRun); tRun = null; } }
function toggleTimer() {
  var el = document.getElementById('tm'); if (!el) return;
  if (tRun) { stopTimer(); return; }
  if (tLeft <= 0) tLeft = D.meta.timerSeconds;
  tRun = setInterval(function () {
    tLeft--; el.firstChild.nodeValue = String(Math.max(0, tLeft));
    el.className = 'timer' + (tLeft <= 10 ? ' low' : '');
    if (tLeft <= 0) { stopTimer(); el.lastChild.textContent = 'time is up'; }
  }, 1000);
}
function full() { if (!document.fullscreenElement) { (document.documentElement.requestFullscreen || function () {}).call(document.documentElement); } else { document.exitFullscreen(); } }

document.addEventListener('keydown', function (e) {
  if (['ArrowRight', 'PageDown', ' ', 'Enter', 'ArrowDown'].indexOf(e.key) >= 0) { e.preventDefault(); show(i + 1); }
  else if (['ArrowLeft', 'PageUp', 'ArrowUp', 'Backspace'].indexOf(e.key) >= 0) { e.preventDefault(); show(i - 1); }
  else if (e.key === 'Home') show(0);
  else if (e.key === 'End') show(slides.length - 1);
  else if (e.key === 'n' || e.key === 'N') document.getElementById('notes').classList.toggle('on');
  else if (e.key === 'f' || e.key === 'F') full();
  else if (e.key === 't' || e.key === 'T') toggleTimer();
});
stage.addEventListener('click', function (e) {
  if (e.target.closest('#tm')) { toggleTimer(); return; }
  if (e.clientX < window.innerWidth * 0.3) show(i - 1); else show(i + 1);
});
document.getElementById('c-prev').onclick = function () { show(i - 1); };
document.getElementById('c-next').onclick = function () { show(i + 1); };
document.getElementById('c-notes').onclick = function () { document.getElementById('notes').classList.toggle('on'); };
document.getElementById('c-full').onclick = full;
window.addEventListener('hashchange', function () { var n = parseInt(location.hash.slice(1), 10); if (n && n - 1 !== i) show(n - 1); });
show((parseInt(location.hash.slice(1), 10) || 1) - 1);
window.Presenter = { count: function () { return slides.length; }, index: function () { return i; } };
})();
