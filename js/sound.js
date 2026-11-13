/* Ambient wind and rain, generated in the browser (no audio file, no licence needed). Off by default. */
window.Sound = (function () {
  var ctx = null, master = null, nodes = [], playing = false;
  function noise(c) {
    var len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0), last = 0;
    for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    var s = c.createBufferSource(); s.buffer = buf; s.loop = true; return s;
  }
  function white(c) {
    var len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var s = c.createBufferSource(); s.buffer = buf; s.loop = true; return s;
  }
  function start() {
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    // wind: brown noise through a slowly moving band-pass
    var w = noise(ctx), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = 0.8;
    var lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.12; lg.gain.value = 260; lfo.connect(lg); lg.connect(bp.frequency);
    var wg = ctx.createGain(); wg.gain.value = 0.55; w.connect(bp); bp.connect(wg); wg.connect(master);
    // rain: white noise, high-passed
    var r = white(ctx), hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2500;
    var rg = ctx.createGain(); rg.gain.value = 0.12; r.connect(hp); hp.connect(rg); rg.connect(master);
    w.start(); r.start(); lfo.start();
    nodes = [w, r, lfo];
    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.5);
    playing = true;
  }
  function stop() {
    if (!playing) return;
    try { nodes.forEach(function (n) { n.stop(); }); master.disconnect(); } catch (e) {}
    nodes = []; playing = false;
  }
  var api = {
    on: false,
    play: function () { if (api.on && !playing) start(); },
    stop: stop,
    toggle: function () { api.on = !api.on; if (!api.on) stop(); }
  };
  return api;
})();
