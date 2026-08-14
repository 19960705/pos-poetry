window.PosAudio = (function () {
  let ctx = null;
  let muted = false;
  let master = null;
  let sfx = null;
  let music = null;
  let hum = null;
  let bgmEl = null;
  let unlocked = false;

  function ensure() {
    if (muted) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 1;
      master.connect(ctx.destination);
      sfx = ctx.createGain();
      sfx.gain.value = 0.42;
      sfx.connect(master);
      music = ctx.createGain();
      music.gain.value = 0.22;
      music.connect(master);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function beep(freq, dur, type, gain) {
    const ac = ensure();
    if (!ac || !sfx) return;
    const t = ac.currentTime;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.16, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(sfx);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function noise(dur, gain, freq) {
    const ac = ensure();
    if (!ac || !sfx) return;
    const n = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, n, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ac.createBufferSource();
    const g = ac.createGain();
    const f = ac.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq || 1800;
    f.Q.value = 0.85;
    src.buffer = buf;
    g.gain.value = gain || 0.12;
    src.connect(f);
    f.connect(g);
    g.connect(sfx);
    src.start();
  }

  function startHum() {
    const ac = ensure();
    if (!ac || !music || hum) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    const f = ac.createBiquadFilter();
    o.type = "sine";
    o.frequency.value = 118;
    f.type = "lowpass";
    f.frequency.value = 280;
    g.gain.value = 0.03;
    o.connect(f);
    f.connect(g);
    g.connect(music);
    o.start();
    hum = { o, g };
  }

  function startBgm(src) {
    if (!src) return;
    if (!bgmEl) {
      bgmEl = new Audio(src);
      bgmEl.loop = true;
      bgmEl.preload = "auto";
    }
    bgmEl.volume = muted ? 0 : 0.28;
    const play = bgmEl.play();
    if (play && play.catch) play.catch(() => {});
  }

  return {
    get muted() { return muted; },
    setMuted(v) {
      muted = v;
      if (sfx) sfx.gain.value = v ? 0 : 0.42;
      if (music) music.gain.value = v ? 0 : 0.22;
      if (bgmEl) bgmEl.volume = v ? 0 : 0.28;
    },
    unlock() {
      unlocked = true;
      ensure();
      startHum();
      startBgm("audio/night-shift.mp3");
    },
    key() { beep(920 + Math.random() * 140, 0.05, "square", 0.14); },
    ok() {
      beep(980, 0.07, "square", 0.18);
      setTimeout(() => beep(1320, 0.09, "square", 0.16), 70);
    },
    err() { beep(210, 0.18, "sawtooth", 0.14); },
    swipe() {
      const ac = ensure();
      if (!ac || !sfx) return;
      const t = ac.currentTime;
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(380, t);
      o.frequency.exponentialRampToValueAtTime(1760, t + 0.24);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      o.connect(g);
      g.connect(sfx);
      o.start(t);
      o.stop(t + 0.32);
    },
    printTick() {
      noise(0.055, 0.1, 2100);
      beep(1860, 0.02, "square", 0.07);
    },
    tear() {
      noise(0.2, 0.2, 1400);
      beep(320, 0.08, "triangle", 0.08);
    },
  };
})();
