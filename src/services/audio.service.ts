import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioContext: AudioContext | null = null;
  private currentOsc: OscillatorNode | null = null;

  private getContext(): AudioContext | null {
    if (!this.audioContext) {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContext();
      } catch (e) {
        console.error('AudioContext not supported');
      }
    }
    return this.audioContext;
  }

  async resumeAudioContext(): Promise<void> {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  playBeep(freq: number = 600, duration: number = 0.15, vol: number = 0.1) {
    const ctx = this.getContext();
    if (!ctx) return;

    this.stopBeep();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = freq;
    gain.gain.value = vol;

    osc.onended = () => {
      if (this.currentOsc === osc) {
        this.currentOsc = null;
      }
      osc.disconnect();
    };

    this.currentOsc = osc;
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  stopBeep() {
    if (this.currentOsc) {
      try {
        this.currentOsc.stop();
        this.currentOsc.disconnect();
      } catch (e) {
        // ignore
      }
      this.currentOsc = null;
    }
  }
}