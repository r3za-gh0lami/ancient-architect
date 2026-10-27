/**
 * Ancient Architect (معمار کهن) - Procedural Web Audio Engine
 * Real-time synthesis for Persian ambient music & soothing focus sounds:
 * 1. Desert Wind through Windcatchers (بادگیرهای کویری)
 * 2. Rain on Adobe Roofs (باران روی بام کاه‌گلی)
 * 3. Persian Traditional Lofi / Setar Melody (سه‌تار و لوفای سنتی در دستگاه شور و همایون)
 * 4. Persian Tile Courtyard Fountain (حوض و فواره سنتی)
 * 5. Interactive SFX (کلیک سنگ، زنگ پیروزی، هشدار خروج)
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.channels = {
      wind: { active: true, volume: 0.35, nodes: null },
      rain: { active: true, volume: 0.35, nodes: null },
      setar: { active: true, volume: 0.45, nodes: null, timerId: null },
      fountain: { active: false, volume: 0.30, nodes: null, timerId: null }
    };
    this.masterGain = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.isInitialized = true;
    console.log("AudioContext initialized successfully at sampleRate:", this.ctx.sampleRate);
  }

  ensureContext() {
    if (!this.isInitialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Helper: Create a 5-second noise buffer
  createNoiseBuffer() {
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filter algorithm
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // 1. DESERT WIND SYNTHESIS (نسیم بادگیرهای یزد)
  startWind() {
    if (!this.channels.wind.active || this.channels.wind.nodes) return;
    this.ensureContext();

    const noiseBuffer = this.createNoiseBuffer();
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Bandpass filter centered around 400Hz with resonance
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(380, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.5, this.ctx.currentTime);

    // LFO to slowly sweep wind frequency (simulates wind gusts)
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8 sec period
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(220, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(this.channels.wind.volume, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    noiseSource.start();
    lfo.start();

    this.channels.wind.nodes = { noiseSource, filter, lfo, gainNode };
  }

  stopWind() {
    if (this.channels.wind.nodes) {
      try {
        this.channels.wind.nodes.noiseSource.stop();
        this.channels.wind.nodes.lfo.stop();
        this.channels.wind.nodes.noiseSource.disconnect();
      } catch (e) {}
      this.channels.wind.nodes = null;
    }
  }

  // 2. RAIN SYNTHESIS (باران روی بام کاه‌گلی)
  startRain() {
    if (!this.channels.rain.active || this.channels.rain.nodes) return;
    this.ensureContext();

    const noiseBuffer = this.createNoiseBuffer();
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(950, this.ctx.currentTime);

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(280, this.ctx.currentTime);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(this.channels.rain.volume, this.ctx.currentTime);

    noiseSource.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(gainNode);
    gainNode.connect(this.masterGain);

    noiseSource.start();
    this.channels.rain.nodes = { noiseSource, gainNode };
  }

  stopRain() {
    if (this.channels.rain.nodes) {
      try {
        this.channels.rain.nodes.noiseSource.stop();
        this.channels.rain.nodes.noiseSource.disconnect();
      } catch (e) {}
      this.channels.rain.nodes = null;
    }
  }

  // 3. PERSIAN TRADITIONAL SETAR & LOFI DRONE (سه‌تار و لوفای سنتی)
  startSetar() {
    if (!this.channels.setar.active || this.channels.setar.nodes) return;
    this.ensureContext();

    // Meditative Base Drone (D2 = 73.42 Hz)
    const droneOsc = this.ctx.createOscillator();
    droneOsc.type = 'triangle';
    droneOsc.frequency.setValueAtTime(73.42, this.ctx.currentTime);

    const droneFilter = this.ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(220, this.ctx.currentTime);

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(this.channels.setar.volume * 0.5, this.ctx.currentTime);

    droneOsc.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(this.masterGain);
    droneOsc.start();

    this.channels.setar.nodes = { droneOsc, droneGain };

    // Persian Modal Scale (Dastgah Shur / Homayoun Frequencies in Hz)
    // Notes: D3, E3, F3, G3, A3, Bb3, C4, D4, E4
    const persianScale = [146.83, 164.81, 174.61, 196.00, 220.00, 233.08, 261.63, 293.66, 329.63];

    // Melodic contemplative plucking loop
    const playNextNote = () => {
      if (!this.channels.setar.nodes) return;
      
      const noteFreq = persianScale[Math.floor(Math.random() * persianScale.length)];
      this.playSetarPluck(noteFreq);

      // Random natural human phrasing pause (2.5s to 5.5s)
      const delay = 2500 + Math.random() * 3000;
      this.channels.setar.timerId = setTimeout(playNextNote, delay);
    };

    this.channels.setar.timerId = setTimeout(playNextNote, 1000);
  }

  playSetarPluck(freq) {
    if (!this.ctx || !this.channels.setar.nodes) return;
    const now = this.ctx.currentTime;

    // Harmonic pair (simulating dual steel strings of Persian Setar)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 1.002, now); // slight chorus detune

    const pluckFilter = this.ctx.createBiquadFilter();
    pluckFilter.type = 'lowpass';
    pluckFilter.frequency.setValueAtTime(2200, now);
    pluckFilter.frequency.exponentialRampToValueAtTime(320, now + 1.2);

    const pluckGain = this.ctx.createGain();
    const vol = this.channels.setar.volume * 0.7;
    pluckGain.gain.setValueAtTime(0, now);
    pluckGain.gain.linearRampToValueAtTime(vol, now + 0.02); // quick acoustic pick attack
    pluckGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4); // gentle string sustain & decay

    osc1.connect(pluckFilter);
    osc2.connect(pluckFilter);
    pluckFilter.connect(pluckGain);
    pluckGain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.5);
    osc2.stop(now + 2.5);
  }

  stopSetar() {
    if (this.channels.setar.timerId) {
      clearTimeout(this.channels.setar.timerId);
      this.channels.setar.timerId = null;
    }
    if (this.channels.setar.nodes) {
      try {
        this.channels.setar.nodes.droneOsc.stop();
        this.channels.setar.nodes.droneOsc.disconnect();
      } catch (e) {}
      this.channels.setar.nodes = null;
    }
  }

  // 4. PERSIAN TILED COURTYARD FOUNTAIN (حوض و فواره آب)
  startFountain() {
    if (!this.channels.fountain.active || this.channels.fountain.nodes) return;
    this.ensureContext();

    // Stream noise
    const noiseBuffer = this.createNoiseBuffer();
    const streamSource = this.ctx.createBufferSource();
    streamSource.buffer = noiseBuffer;
    streamSource.loop = true;

    const streamFilter = this.ctx.createBiquadFilter();
    streamFilter.type = 'bandpass';
    streamFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    streamFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    const streamGain = this.ctx.createGain();
    streamGain.gain.setValueAtTime(this.channels.fountain.volume * 0.4, this.ctx.currentTime);

    streamSource.connect(streamFilter);
    streamFilter.connect(streamGain);
    streamGain.connect(this.masterGain);
    streamSource.start();

    this.channels.fountain.nodes = { streamSource, streamGain };

    // Water droplet bursts
    const triggerDrop = () => {
      if (!this.channels.fountain.nodes) return;
      this.playWaterDrop();
      const delay = 600 + Math.random() * 1200;
      this.channels.fountain.timerId = setTimeout(triggerDrop, delay);
    };
    triggerDrop();
  }

  playWaterDrop() {
    if (!this.ctx || !this.channels.fountain.nodes) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const startFreq = 800 + Math.random() * 600;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.5, now + 0.08);

    gain.gain.setValueAtTime(this.channels.fountain.volume * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  stopFountain() {
    if (this.channels.fountain.timerId) {
      clearTimeout(this.channels.fountain.timerId);
      this.channels.fountain.timerId = null;
    }
    if (this.channels.fountain.nodes) {
      try {
        this.channels.fountain.nodes.streamSource.stop();
        this.channels.fountain.nodes.streamSource.disconnect();
      } catch (e) {}
      this.channels.fountain.nodes = null;
    }
  }

  // Master Sound Play / Pause Toggle
  startAllActive() {
    this.ensureContext();
    if (this.channels.wind.active) this.startWind();
    if (this.channels.rain.active) this.startRain();
    if (this.channels.setar.active) this.startSetar();
    if (this.channels.fountain.active) this.startFountain();
  }

  stopAll() {
    this.stopWind();
    this.stopRain();
    this.stopSetar();
    this.stopFountain();
  }

  setChannelVolume(channelName, vol) {
    if (!this.channels[channelName]) return;
    this.channels[channelName].volume = vol;
    if (this.channels[channelName].nodes && this.channels[channelName].nodes.gainNode) {
      this.channels[channelName].nodes.gainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }

  toggleChannel(channelName) {
    if (!this.channels[channelName]) return;
    this.channels[channelName].active = !this.channels[channelName].active;
    if (this.channels[channelName].active) {
      if (channelName === 'wind') this.startWind();
      if (channelName === 'rain') this.startRain();
      if (channelName === 'setar') this.startSetar();
      if (channelName === 'fountain') this.startFountain();
    } else {
      if (channelName === 'wind') this.stopWind();
      if (channelName === 'rain') this.stopRain();
      if (channelName === 'setar') this.stopSetar();
      if (channelName === 'fountain') this.stopFountain();
    }
    return this.channels[channelName].active;
  }

  // INTERACTIVE SOUND EFFECTS
  playStoneClick() {
    this.ensureContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.05);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  playTrophyChime() {
    this.ensureContext();
    // Beautiful pentatonic harp chime
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      const time = this.ctx.currentTime + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 1.3);
    });
  }

  playAlertAlarm() {
    this.ensureContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.4);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.5);
  }
}

// Global Sound Engine Singleton
window.soundEngine = new SoundEngine();
