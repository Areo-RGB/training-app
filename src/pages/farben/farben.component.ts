import { Component, OnDestroy, signal, inject, computed, effect, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AudioService } from '../../services/audio.service';

// Configuration for Background-Color based Stroop (Card Style)
const COLORS = {
  white: { 
    id: 'white', 
    label: 'White', 
    german: 'weiß', 
    bgClass: 'bg-gray-100' 
  },
  red: { 
    id: 'red', 
    label: 'Red', 
    german: 'rot', 
    bgClass: 'bg-red-600' 
  },
  blue: { 
    id: 'blue', 
    label: 'Blue', 
    german: 'blau', 
    bgClass: 'bg-blue-600' 
  },
  green: { 
    id: 'green', 
    label: 'Green', 
    german: 'grün', 
    bgClass: 'bg-green-600' 
  },
  yellow: { 
    id: 'yellow', 
    label: 'Yellow', 
    german: 'gelb', 
    bgClass: 'bg-yellow-400' 
  }
};
type ColorKey = keyof typeof COLORS;

@Component({
  selector: 'app-farben',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- CONFIG MODE -->
    @if (status() === 'config') {
      <div class="flex flex-col items-center justify-center min-h-[60vh] animate-enter">
        <div class="w-full max-w-md bg-[#151A23] rounded-3xl p-8 shadow-xl border border-white/5 transition-all">
            
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-2xl font-bold text-[#F1F5F9]">Farben</h1>
                    <p class="text-[#94A3B8]">Stroop-Effekt Trainer</p>
                </div>
                <div class="w-12 h-12 bg-[#0B0E14] border border-white/5 rounded-xl flex items-center justify-center text-[#3B82F6] shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                </div>
            </div>

            <div class="space-y-4">
                
                <!-- Game Mode Toggle -->
                <div class="flex items-center justify-between p-4 bg-[#0B0E14] border border-white/5 rounded-xl cursor-pointer hover:bg-[#2A3441] transition-colors" (click)="toggleSoundControlMode()">
                    <div>
                        <div class="font-semibold text-[#F1F5F9]">Sound Steuerung</div>
                        <div class="text-xs text-[#94A3B8]">Farbe wechselt bei Geräusch</div>
                    </div>
                    <button class="w-12 h-7 rounded-full transition-colors relative"
                            [class]="soundControlMode() ? 'bg-[#3B82F6]' : 'bg-[#2A3441]'">
                        <div class="w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform"
                                [class]="soundControlMode() ? 'left-6' : 'left-1'"></div>
                    </button>
                </div>

                <!-- Settings Block -->
                <div class="w-full bg-[#0B0E14] rounded-xl p-6 flex flex-col gap-6 border border-white/5 animate-enter">
                    
                    @if (!soundControlMode()) {
                        <!-- Speed Control -->
                        <div class="flex flex-col items-center">
                            <span class="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Geschwindigkeit (ms)</span>
                            <div class="flex items-center gap-6">
                                <button (click)="adjustInterval(-500)" 
                                        class="w-10 h-10 rounded-full bg-[#151A23] text-[#F1F5F9] hover:bg-[#2A3441] font-bold text-xl btn-press border border-white/10 flex items-center justify-center">
                                    -
                                </button>
                                <span class="text-2xl font-black w-24 text-center tabular-nums text-[#F1F5F9]">{{ intervalMs() }}</span>
                                <button (click)="adjustInterval(500)" 
                                        class="w-10 h-10 rounded-full bg-[#151A23] text-[#F1F5F9] hover:bg-[#2A3441] font-bold text-xl btn-press border border-white/10 flex items-center justify-center">
                                    +
                                </button>
                            </div>
                        </div>

                        <!-- Steps Control -->
                        <div class="flex flex-col items-center">
                            <span class="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Anzahl Änderungen</span>
                            <div class="flex items-center gap-6">
                                <button (click)="adjustSteps(-5)" 
                                        class="w-10 h-10 rounded-full bg-[#151A23] text-[#F1F5F9] hover:bg-[#2A3441] font-bold text-xl btn-press border border-white/10 flex items-center justify-center">
                                    -
                                </button>
                                <span class="text-2xl font-black w-24 text-center tabular-nums text-[#F1F5F9]">{{ limitSteps() }}</span>
                                <button (click)="adjustSteps(5)" 
                                        class="w-10 h-10 rounded-full bg-[#151A23] text-[#F1F5F9] hover:bg-[#2A3441] font-bold text-xl btn-press border border-white/10 flex items-center justify-center">
                                    +
                                </button>
                            </div>
                        </div>
                    } @else {
                        <!-- Total Duration Control -->
                        <div class="flex flex-col items-center">
                            <span class="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Dauer (Sekunden)</span>
                            <div class="flex items-center gap-6">
                                <button (click)="adjustDuration(-5)" 
                                        class="w-10 h-10 rounded-full bg-[#151A23] text-[#F1F5F9] hover:bg-[#2A3441] font-bold text-xl btn-press border border-white/10 flex items-center justify-center">
                                    -
                                </button>
                                <span class="text-2xl font-black w-24 text-center tabular-nums text-[#F1F5F9]">{{ totalDurationSec() }}</span>
                                <button (click)="adjustDuration(5)" 
                                        class="w-10 h-10 rounded-full bg-[#151A23] text-[#F1F5F9] hover:bg-[#2A3441] font-bold text-xl btn-press border border-white/10 flex items-center justify-center">
                                    +
                                </button>
                            </div>
                        </div>
                    }

                </div>

                <!-- Toggles Grid -->
                <div class="grid grid-cols-1 gap-3">
                    
                    <!-- Play Sound Toggle (Only visible if not in sound control mode, to avoid confusion?) No, let's keep it optionally -->
                    <div class="flex items-center justify-between p-4 bg-[#0B0E14] border border-white/5 rounded-xl cursor-pointer hover:bg-[#2A3441] transition-colors" (click)="togglePlaySound()">
                        <div>
                            <div class="font-semibold text-[#F1F5F9]">Sound Feedback</div>
                            <div class="text-xs text-[#94A3B8]">Piep bei Wechsel</div>
                        </div>
                        <button class="w-12 h-7 rounded-full transition-colors relative"
                                [class]="playSound() ? 'bg-[#3B82F6]' : 'bg-[#2A3441]'">
                            <div class="w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform"
                                 [class]="playSound() ? 'left-6' : 'left-1'"></div>
                        </button>
                    </div>

                    <!-- Sound Counter Toggle -->
                    <!-- In Sound Control Mode, this is forced ON -->
                    <div class="bg-[#0B0E14] border border-white/5 rounded-xl transition-colors hover:bg-[#151A23]/50"
                         [class.opacity-80]="soundControlMode()"
                         [class.pointer-events-none]="soundControlMode()">
                        
                        <div class="flex items-center justify-between p-4 cursor-pointer" (click)="!soundControlMode() && toggleSoundCounter()">
                            <div>
                                <div class="font-semibold text-[#F1F5F9]">Sound-Zähler / Input</div>
                                <div class="text-xs text-[#94A3B8]">Zählt bei Lärm hoch</div>
                            </div>
                            <button class="w-12 h-7 rounded-full transition-colors relative"
                                    [class]="useSoundCounter() ? 'bg-[#3B82F6]' : 'bg-[#2A3441]'">
                                <div class="w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform"
                                     [class]="useSoundCounter() ? 'left-6' : 'left-1'"></div>
                            </button>
                        </div>
                        
                        @if (useSoundCounter()) {
                            <div class="px-4 pb-4 pt-0 animate-enter border-t border-white/5 mt-2 pointer-events-auto">
                                <div class="pt-3 space-y-3">
                                    
                                    <!-- Microphone Selector -->
                                    @if (availableDevices().length > 0) {
                                        <div>
                                            <div class="flex justify-between text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                                                <span>Mikrofon</span>
                                            </div>
                                            <div class="relative">
                                                <select [ngModel]="selectedDeviceId()" (ngModelChange)="setSelectedDevice($event)"
                                                        class="w-full bg-[#151A23] text-[#F1F5F9] text-xs font-medium rounded-lg py-2 pl-3 pr-8 border border-white/10 outline-none focus:border-[#3B82F6] appearance-none cursor-pointer hover:bg-[#2A3441] transition-colors">
                                                    @for (device of availableDevices(); track device.deviceId) {
                                                        <option [value]="device.deviceId" class="bg-[#151A23] text-[#F1F5F9]">
                                                            {{ device.label || 'Mikrofon ' + ($index + 1) }}
                                                        </option>
                                                    }
                                                </select>
                                                <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#94A3B8]">
                                                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                                </div>
                                            </div>
                                        </div>
                                    }

                                    <!-- Visualizer Bar -->
                                    <div>
                                        <div class="flex justify-between text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                                            <span>Input Level</span>
                                        </div>
                                        <div class="h-4 bg-[#151A23] rounded-md overflow-hidden border border-white/5 relative">
                                            <!-- Threshold Marker -->
                                            <div class="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" [style.left.%]="soundThreshold()"></div>
                                            <!-- Level Bar -->
                                            <div class="absolute inset-y-0 left-0 bg-emerald-500 transition-[width] duration-75 ease-out opacity-80"
                                                 [style.width.%]="currentSoundLevel()"></div>
                                        </div>
                                    </div>

                                    <!-- Threshold Slider -->
                                    <div>
                                         <div class="flex justify-between text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                                            <span>Schwellenwert</span>
                                            <span>{{ soundThreshold() }}</span>
                                         </div>
                                         <input type="range" min="1" max="100" [ngModel]="soundThreshold()" (ngModelChange)="soundThreshold.set($event)"
                                                class="w-full h-1.5 bg-[#2A3441] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]" />
                                    </div>

                                    <!-- Cooldown Slider -->
                                    <div>
                                         <div class="flex justify-between text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                                            <span>Cooldown (ms)</span>
                                            <span>{{ soundCooldown() }}</span>
                                         </div>
                                         <input type="range" min="100" max="2000" step="100" [ngModel]="soundCooldown()" (ngModelChange)="soundCooldown.set($event)"
                                                class="w-full h-1.5 bg-[#2A3441] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]" />
                                    </div>
                                    
                                    @if (micError()) {
                                        <div class="text-xs text-red-400 font-medium bg-red-900/10 p-2 rounded">
                                            {{ micError() }}
                                        </div>
                                    }
                                </div>
                            </div>
                        }
                    </div>

                </div>
            </div>

            <button (click)="startGame()"
                    class="w-full mt-8 bg-[#3B82F6] text-white py-4 rounded-xl text-lg font-bold shadow-lg hover-spring transition-all hover:bg-[#2563EB]">
                Training Starten
            </button>
        </div>
      </div>
    }

    <!-- PLAYING MODE -->
    @if (status() === 'playing') {
      <div class="fixed inset-0 z-[100] flex flex-col h-full transition-all duration-300 animate-enter"
           [class]="displayConfig().bgClass">
        
        <!-- Controls -->
        <div class="absolute top-6 right-6 z-30 flex gap-4">
             <!-- Stop Button -->
             <button (click)="stopGame()" 
                     class="group flex items-center gap-2 px-4 py-2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full text-white font-medium transition-all hover:pr-6 border border-white/10 shadow-lg">
                <div class="w-2 h-2 rounded-full bg-red-400 group-hover:animate-pulse"></div>
                Stopp
             </button>
        </div>
        
        <!-- Progress Counter -->
        <div class="absolute top-6 left-6 z-30">
             <div class="px-4 py-2 bg-black/30 backdrop-blur-md rounded-full text-white/80 font-mono font-bold border border-white/10">
                 @if (soundControlMode()) {
                     {{ timeLeft() }}s
                 } @else {
                     {{ currentStepCount() }} / {{ limitSteps() }}
                 }
             </div>
        </div>

        <!-- Waiting for First Sound Overlay -->
        @if (soundControlMode() && waitingForFirstSound()) {
            <div class="absolute inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm animate-enter">
                <div class="text-center p-6">
                    <div class="w-24 h-24 bg-[#3B82F6] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                         <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                            <line x1="12" y1="19" x2="12" y2="23"/>
                            <line x1="8" y1="23" x2="16" y2="23"/>
                         </svg>
                    </div>
                    <h2 class="text-3xl md:text-4xl font-bold text-white mb-3">Bereit?</h2>
                    <p class="text-[#94A3B8] text-lg">Mache ein Geräusch, um zu starten!</p>
                </div>
            </div>
        }

        <!-- Sound Counter Overlay (Shown if enabled) -->
        @if (useSoundCounter()) {
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <span class="text-[12rem] md:text-[18rem] font-black text-white leading-none select-none tabular-nums animate-enter-scale" 
                      style="-webkit-text-stroke: 4px black; paint-order: stroke fill; text-shadow: 0 4px 20px rgba(0,0,0,0.5);">
                    {{ soundCount() }}
                </span>
            </div>
        }

      </div>
    }
  `
})
export class FarbenComponent implements OnDestroy {
  private router: Router = inject(Router);
  private audio = inject(AudioService);
  private zone = inject(NgZone);

  // Persistence Initializers
  private loadBoolean(key: string, def: boolean): boolean {
    return localStorage.getItem(key) !== null ? localStorage.getItem(key) === 'true' : def;
  }
  private loadNumber(key: string, def: number): number {
    return parseInt(localStorage.getItem(key) || String(def), 10);
  }

  status = signal<'config' | 'playing'>('config');

  // Game Logic (Standard)
  currentColor = signal<ColorKey>('white');
  intervalMs = signal(this.loadNumber('farben_interval', 2000));
  limitSteps = signal(this.loadNumber('farben_steps', 10)); 
  currentStepCount = signal(0);
  playSound = signal(this.loadBoolean('farben_playSound', false));

  // Game Logic (Sound Control Mode)
  soundControlMode = signal(this.loadBoolean('farben_soundControlMode', false));
  totalDurationSec = signal(this.loadNumber('farben_totalDuration', 20));
  timeLeft = signal(0);
  waitingForFirstSound = signal(false);

  // Sound Counter Logic
  useSoundCounter = signal(this.loadBoolean('farben_useSoundCounter', false));
  soundThreshold = signal(this.loadNumber('farben_soundThreshold', 50));
  soundCooldown = signal(this.loadNumber('farben_soundCooldown', 500));
  soundCount = signal(0);
  currentSoundLevel = signal(0);
  micError = signal('');
  
  // Audio Device Handling
  selectedDeviceId = signal(localStorage.getItem('farben_selectedDeviceId') || '');
  availableDevices = signal<MediaDeviceInfo[]>([]);
  
  private intervalRef: any = null;
  private timerRef: any = null;
  private colorKeys = Object.keys(COLORS) as ColorKey[];

  // Audio Processing Internals
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private frameId: number = 0;
  private lastTriggerTime = 0;

  displayConfig = computed(() => {
    return COLORS[this.currentColor()];
  });

  constructor() {
    // Setup Persistence Effects
    effect(() => localStorage.setItem('farben_interval', String(this.intervalMs())));
    effect(() => localStorage.setItem('farben_steps', String(this.limitSteps())));
    effect(() => localStorage.setItem('farben_playSound', String(this.playSound())));
    effect(() => localStorage.setItem('farben_useSoundCounter', String(this.useSoundCounter())));
    effect(() => localStorage.setItem('farben_soundThreshold', String(this.soundThreshold())));
    effect(() => localStorage.setItem('farben_soundCooldown', String(this.soundCooldown())));
    effect(() => localStorage.setItem('farben_selectedDeviceId', this.selectedDeviceId()));
    effect(() => localStorage.setItem('farben_soundControlMode', String(this.soundControlMode())));
    effect(() => localStorage.setItem('farben_totalDuration', String(this.totalDurationSec())));

    // Attempt to load devices initially
    this.loadDevices();

    effect(() => {
      // Toggle Audio Visualization in Config Mode
      // If we are in Config, and UseSoundCounter is ON (or Sound Control is ON which forces it), init audio
      if (this.status() === 'config' && (this.useSoundCounter() || this.soundControlMode())) {
        this.initAudio();
      } else if (this.status() === 'config' && !this.useSoundCounter() && !this.soundControlMode()) {
        this.stopAudio();
      }
    });
  }

  toggleSoundControlMode() {
      this.soundControlMode.update(v => !v);
      if (this.soundControlMode()) {
          this.useSoundCounter.set(true); // Force mic on
      }
  }

  togglePlaySound() {
    this.playSound.update(v => !v);
  }

  toggleSoundCounter() {
    this.useSoundCounter.update(v => !v);
  }

  adjustSteps(delta: number) {
      this.limitSteps.update(v => Math.max(5, v + delta));
  }

  adjustInterval(delta: number) {
      this.intervalMs.update(v => Math.max(500, v + delta));
  }

  adjustDuration(delta: number) {
      this.totalDurationSec.update(v => Math.max(5, v + delta));
  }

  goHome() {
    this.router.navigate(['/']);
  }

  startGame() {
    this.status.set('playing');
    this.currentStepCount.set(0);
    this.soundCount.set(0);
    
    // Ensure audio is running if enabled or forced by mode
    if (this.useSoundCounter() || this.soundControlMode()) {
        this.initAudio();
    } else {
        this.stopAudio();
    }

    if (this.soundControlMode()) {
        // Sound Control Mode: Setup but wait for first sound
        this.timeLeft.set(this.totalDurationSec());
        this.waitingForFirstSound.set(true);
        // Do not start timer or change color yet.
        this.currentColor.set('white'); 
    } else {
        // Standard Mode: Start Interval
        this.startInterval();
        this.step();
    }
  }

  stopGame() {
    this.status.set('config');
    this.waitingForFirstSound.set(false);
    this.stopInterval();
    this.stopDurationTimer();
    
    // Check if we need to keep audio running for visualization in config
    if (!this.useSoundCounter() && !this.soundControlMode()) {
        this.stopAudio();
    }
  }

  // --- Audio Logic for Sound Counter ---
  
  async loadDevices() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices.filter(d => d.kind === 'audioinput');
        this.availableDevices.set(mics);
        
        // If no device selected (or saved device not found), pick first or default
        if (mics.length > 0) {
            const current = this.selectedDeviceId();
            const exists = mics.find(d => d.deviceId === current);
            if (!current || !exists) {
                const defaultMic = mics.find(d => d.deviceId === 'default');
                this.selectedDeviceId.set(defaultMic ? defaultMic.deviceId : mics[0].deviceId);
            }
        }
    } catch (e) {
        console.error('Error enumerating devices:', e);
    }
  }

  setSelectedDevice(deviceId: string) {
      this.selectedDeviceId.set(deviceId);
      // Restart audio if currently active/config visualization
      if (this.useSoundCounter() || this.soundControlMode()) {
          this.initAudio();
      }
  }

  async initAudio() {
    this.stopAudio(); 

    try {
        this.micError.set('');
        
        const constraints: MediaStreamConstraints = {
            audio: this.selectedDeviceId() 
                ? { deviceId: { exact: this.selectedDeviceId() } }
                : true
        };

        this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        this.loadDevices();
        
        this.audioContext = new AudioContext();
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.analyser = this.audioContext.createAnalyser();
        
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.5;

        source.connect(this.analyser);
        this.startAudioLoop();
    } catch (e) {
        console.error('Mic access error', e);
        this.micError.set('Mikrofonzugriff verweigert.');
        this.useSoundCounter.set(false);
        this.soundControlMode.set(false);
    }
  }

  startAudioLoop() {
      const loop = () => {
          if (!this.analyser) return;

          const data = new Uint8Array(this.analyser.fftSize);
          this.analyser.getByteTimeDomainData(data);

          let sum = 0;
          for (let i = 0; i < data.length; i++) {
              const v = (data[i] - 128) / 128;
              sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);
          const level = Math.min(100, rms * 400);

          this.zone.run(() => {
              this.currentSoundLevel.set(level);
              this.checkAudioThreshold(level);
          });

          this.frameId = requestAnimationFrame(loop);
      };

      this.zone.runOutsideAngular(() => {
          this.frameId = requestAnimationFrame(loop);
      });
  }

  checkAudioThreshold(level: number) {
      if (this.status() === 'playing') {
          const now = Date.now();
          if (level > this.soundThreshold() && (now - this.lastTriggerTime > this.soundCooldown())) {
              this.lastTriggerTime = now;
              
              if (this.soundControlMode() && this.waitingForFirstSound()) {
                  // First sound detected: Start the game!
                  this.waitingForFirstSound.set(false);
                  this.startDurationTimer();
                  this.step(true); // First color change
                  this.soundCount.update(c => c + 1);
                  return;
              }

              this.soundCount.update(c => c + 1);

              // NEW: If Sound Control Mode is ON, trigger the color change
              if (this.soundControlMode()) {
                  this.step();
              }
          }
      }
  }

  stopAudio() {
      cancelAnimationFrame(this.frameId);
      if (this.mediaStream) {
          this.mediaStream.getTracks().forEach(t => t.stop());
          this.mediaStream = null;
      }
      if (this.audioContext) {
          this.audioContext.close();
          this.audioContext = null;
      }
      this.currentSoundLevel.set(0);
  }

  // --- Game Loop (Duration Timer for Sound Mode) ---

  private startDurationTimer() {
      this.stopDurationTimer();
      this.timerRef = setInterval(() => {
          const t = this.timeLeft();
          if (t <= 0) {
              this.stopGame();
          } else {
              this.timeLeft.set(t - 1);
          }
      }, 1000);
  }

  private stopDurationTimer() {
      if (this.timerRef) {
          clearInterval(this.timerRef);
          this.timerRef = null;
      }
  }

  // --- Game Loop (Interval for Standard Mode) ---

  private startInterval() {
    this.stopInterval();
    this.intervalRef = setInterval(() => this.step(), this.intervalMs());
  }

  private stopInterval() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
  }

  private step(force: boolean = false) {
    // In Standard Mode, check limit. In Sound Control Mode, limit is duration (handled by timer)
    if (!this.soundControlMode() && !force && this.currentStepCount() >= this.limitSteps()) {
      this.stopGame();
      return;
    }

    // 1. Pick Color (Stimulus)
    const candidates = this.colorKeys.filter(c => c !== this.currentColor());
    const pool = candidates.length > 0 ? candidates : this.colorKeys;
    const nextColor = pool[Math.floor(Math.random() * pool.length)];
    
    this.currentColor.set(nextColor);

    if (this.playSound()) {
      this.audio.playBeep(600, 0.1);
    }

    this.currentStepCount.update(c => c + 1);
  }

  ngOnDestroy() {
    this.stopInterval();
    this.stopDurationTimer();
    this.stopAudio();
  }
}