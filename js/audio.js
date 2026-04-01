// Procedural Web Audio API Engine for Retro Sound Effects
class AudioEngine {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterVolume = this.ctx.createGain();
        this.masterVolume.gain.value = 0.3; // Default 30% volume
        this.masterVolume.connect(this.ctx.destination);

        // Mute state
        this.isMuted = localStorage.getItem('poki_muted') === 'true';
        this.masterVolume.gain.value = this.isMuted ? 0 : 0.3;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.masterVolume.gain.value = this.isMuted ? 0 : 0.3;
        localStorage.setItem('poki_muted', this.isMuted);
        return this.isMuted;
    }

    _playTone(freq, type, duration, volSlide = false) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(1, this.ctx.currentTime);

        if (volSlide) {
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        } else {
            gain.gain.setValueAtTime(1, this.ctx.currentTime + duration - 0.05);
            gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
        }

        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playLaser() {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.masterVolume);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    playExplosion() {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const bufferSize = this.ctx.sampleRate * 0.5; // 0.5 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1; // white noise
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Lowpass filter to make it sound bassy
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.5);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterVolume);

        noise.start();
    }

    playCoin() {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
        osc.frequency.setValueAtTime(1500, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    playJump() {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    playPowerup() {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.1);
        osc.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 0.2);
        osc.frequency.linearRampToValueAtTime(1600, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
    }

    playClick() {
        this._playTone(800, 'sine', 0.05, true);
    }
}

// Global instance
window.audio = new AudioEngine();
