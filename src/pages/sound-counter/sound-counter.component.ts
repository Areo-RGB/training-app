import { Component, OnDestroy, OnInit, signal, effect, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sound-counter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-[60vh] animate-enter">
      <div class="w-full bg-[#151A23] rounded-3xl p-8 shadow-xl border border-white/5 text-center transition-all relative overflow-hidden">
        
        <!-- Header -->
        <div class="w-20 h-20 bg-[#0B0E14] rounded-full flex items-center justify-center mx-auto mb-6 text-[#3B82F6] border border-white/5 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-[#F1F5F9] mb-2">Sound Counter</h1>
        <p class="text-[#94A3B8] mb-8">Increments counter when sound exceeds threshold.</p>

        @if (error()) {
            <div class="mb-6 p-4 bg-red-900/20 rounded-xl border border-red-900/30">
                <p class="text-red-400 text-sm mb-2">{{ error() }}</p>
                <button (click)="requestPermission()" class="text-sm font-bold text-[#3B82F6] hover:underline">Retry Permission</button>
            </div>
        }

        <!-- Config Mode -->
        @if (status() === 'config') {
            <div class="space-y-6 mb-8 text-left animate-enter">
                
                <!-- Visualization -->
                <div class="bg-[#0B0E14] p-4 rounded-xl relative overflow-hidden h-16 flex items-center justify-center border border-white/5">
                    <div class="absolute inset-y-0 left-0 bg-[#3B82F6] opacity-30 transition-[width] duration-75 ease-linear"
                            [style.width.%]="currentLevel()"></div>
                    <div class="absolute inset-y-0 w-0.5 bg-red-500 z-10" [style.left.%]="threshold()"></div>
                    <span class="relative z-20 font-mono font-bold text-[#F1F5F9] mix-blend-screen">Level: {{ currentLevel() | number:'1.0-0' }}</span>
                </div>

                <!-- Threshold Slider -->
                <div>
                    <label class="flex justify-between text-sm font-bold text-[#94A3B8] mb-2 uppercase tracking-wider">
                        <span>Threshold</span>
                        <span>{{ threshold() }}</span>
                    </label>
                    <input type="range" min="1" max="100" [ngModel]="threshold()" (ngModelChange)="threshold.set($event)" 
                            class="w-full h-2 bg-[#2A3441] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]">
                    <p class="text-xs text-[#64748B] mt-2">Adjust until the bar stays below the red line when silent.</p>
                </div>

                    <!-- Cooldown Slider -->
                <div>
                    <label class="flex justify-between text-sm font-bold text-[#94A3B8] mb-2 uppercase tracking-wider">
                        <span>Cooldown (ms)</span>
                        <span>{{ cooldown() }}</span>
                    </label>
                    <input type="range" min="100" max="2000" step="100" [ngModel]="cooldown()" (ngModelChange)="cooldown.set($event)" 
                            class="w-full h-2 bg-[#2A3441] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]">
                </div>
            </div>

            <button (click)="start()" class="w-full py-4 rounded-xl bg-[#3B82F6] text-white font-bold hover:bg-[#2563EB] hover-spring shadow-lg transition-colors">
                Start Counting
            </button>
        }

        <!-- Active Mode -->
        @if (status() === 'active') {
            <div class="animate-enter">
                <div class="relative flex flex-col items-center justify-center">
                    <div class="text-[8rem] leading-none font-black text-[#F1F5F9] tabular-nums transition-all duration-75 select-none"
                            [class.scale-110]="isTriggered()"
                            [class.text-[#10B981]]="isTriggered()">
                        {{ count() }}
                    </div>

                    <!-- Rate Display -->
                    <div class="text-xl font-bold text-[#64748B] mb-2 tabular-nums">
                        {{ rate() }}/s
                    </div>

                    @if (isTriggered()) {
                        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div class="w-full h-full rounded-full bg-[#10B981]/20 animate-ping"></div>
                        </div>
                    }

                    <!-- Fullscreen Toggle -->
                    <button (click)="viewMode.set('fullscreen')" class="mt-2 mb-8 p-3 rounded-full text-[#64748B] hover:bg-[#2A3441] hover:text-[#F1F5F9] transition-colors" title="Fullscreen Display">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <polyline points="9 21 3 21 3 15"></polyline>
                            <line x1="21" y1="3" x2="14" y2="10"></line>
                            <line x1="3" y1="21" x2="10" y2="14"></line>
                        </svg>
                    </button>
                </div>

                <!-- Mini Visualizer -->
                <div class="w-full h-2 bg-[#0B0E14] rounded-full overflow-hidden mb-8 relative border border-white/5">
                        <div class="absolute inset-y-0 left-0 bg-[#3B82F6] transition-[width] duration-75"
                            [style.width.%]="currentLevel()"></div>
                        <div class="absolute inset-y-0 w-0.5 bg-red-500 z-10" [style.left.%]="threshold()"></div>
                </div>

                <div class="flex gap-4">
                    <button (click)="reset()" class="flex-1 py-3 rounded-xl bg-[#2A3441] text-[#94A3B8] font-bold hover:bg-[#334155] btn-press transition-colors">
                        Reset
                    </button>
                    <button (click)="stop()" class="flex-1 py-3 rounded-xl bg-[#64748B] text-white font-bold hover:bg-[#475569] btn-press transition-colors">
                        Stop
                    </button>
                </div>
            </div>
        }
      </div>
    </div>

    <!-- Fullscreen Overlay -->
    @if (viewMode() === 'fullscreen') {
      <div class="fixed inset-0 z-50 bg-[#0B0E14] flex flex-col items-center justify-center animate-enter">
        <button (click)="viewMode.set('normal')" class="absolute top-6 right-6 p-4 bg-[#151A23] rounded-full text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#2A3441] transition-all shadow-sm border border-white/5">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <polyline points="4 14 10 14 10 20"></polyline>
             <polyline points="20 10 14 10 14 4"></polyline>
             <line x1="14" y1="10" x2="21" y2="3"></line>
             <line x1="3" y1="21" x2="10" y2="14"></line>
           </svg>
        </button>

        <div class="text-[25vw] font-black text-[#F1F5F9] tabular-nums leading-none transition-all duration-75 select-none"
             [class.scale-110]="isTriggered()"
             [class.text-[#10B981]]="isTriggered()">
            {{ count() }}
        </div>
        <!-- Fullscreen Rate Display -->
        <div class="text-[5vw] font-bold text-[#64748B] tabular-nums mt-4 opacity-70">
            {{ rate() }}/s
        </div>
      </div>
    }
  `
})
export class SoundCounterComponent implements OnInit, OnDestroy {
  private zone = inject(NgZone);

  // Configuration
  threshold = signal(50);
  cooldown = signal(500);
  
  // State
  hasPermission = signal(false);
  error = signal<string>('');
  status = signal<'config' | 'active'>('config');
  viewMode = signal<'normal' | 'fullscreen'>('normal');
  currentLevel = signal(0);
  count = signal(0);
  rate = signal(0);
  isTriggered = signal(false);

  // Audio Internals
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private frameId: number = 0;
  private lastTriggerTime = 0;
  
  // Rate calculation
  private triggerTimestamps: number[] = [];

  constructor() {
    // Load saved settings
    const savedThreshold = localStorage.getItem('sound_counter_threshold');
    if (savedThreshold) this.threshold.set(parseInt(savedThreshold, 10));

    const savedCooldown = localStorage.getItem('sound_counter_cooldown');
    if (savedCooldown) this.cooldown.set(parseInt(savedCooldown, 10));

    effect(() => localStorage.setItem('sound_counter_threshold', String(this.threshold())));
    effect(() => localStorage.setItem('sound_counter_cooldown', String(this.cooldown())));
  }

  ngOnInit() {
    this.requestPermission();
  }

  async requestPermission() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.hasPermission.set(true);
      this.error.set('');
      this.initAudio();
    } catch (e: any) {
      console.error(e);
      // If error, likely permission denied or device not found.
      // We set error, which shows the retry button.
      this.error.set('Could not access microphone. Please check permissions.');
    }
  }

  initAudio() {
    if (!this.stream) return;

    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyser = this.audioContext.createAnalyser();
    
    // Config analyser
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.5;
    
    source.connect(this.analyser);
    
    this.startLoop();
  }

  startLoop() {
    const loop = () => {
      if (this.analyser) {
        const data = new Uint8Array(this.analyser.fftSize);
        this.analyser.getByteTimeDomainData(data);
        
        // Calculate RMS (Root Mean Square) for volume
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          // data[i] is 0-255, silence is ~128
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        
        // Scale RMS to 0-100 for UI
        // Typical speech might be 0.05 - 0.2 RMS. Loud might be 0.5+.
        // Let's multiply by 400 to make 0.25 RMS = 100%
        const level = Math.min(100, rms * 400);

        this.zone.run(() => {
          this.currentLevel.set(level);
          this.checkThreshold(level);
        });
      }
      this.frameId = requestAnimationFrame(loop);
    };
    this.zone.runOutsideAngular(() => {
      this.frameId = requestAnimationFrame(loop);
    });
  }

  checkThreshold(level: number) {
    if (this.status() !== 'active') return;

    const now = Date.now();

    // Trigger Logic
    if (level > this.threshold() && (now - this.lastTriggerTime > this.cooldown())) {
      this.count.update(c => c + 1);
      this.lastTriggerTime = now;
      this.isTriggered.set(true);
      
      this.triggerTimestamps.push(now);
      
      setTimeout(() => this.isTriggered.set(false), 150);
    }

    // Rate Calculation (Rolling 1s window)
    if (this.triggerTimestamps.length > 0) {
        const cutoff = now - 1000;
        // Filter out timestamps older than 1 second
        if (this.triggerTimestamps[0] < cutoff) {
             this.triggerTimestamps = this.triggerTimestamps.filter(t => t > cutoff);
        }
    }
    
    if (this.rate() !== this.triggerTimestamps.length) {
        this.rate.set(this.triggerTimestamps.length);
    }
  }

  start() {
    this.status.set('active');
    this.count.set(0);
    this.triggerTimestamps = [];
    this.rate.set(0);
  }

  reset() {
    this.count.set(0);
    this.triggerTimestamps = [];
    this.rate.set(0);
  }

  stop() {
    this.status.set('config');
    this.viewMode.set('normal');
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.frameId);
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}