import { Component, Input, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-timer-instance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative bg-[#151A23] border border-white/5 rounded-2xl overflow-hidden flex flex-col items-center justify-between min-h-[420px] pb-8 shadow-xl transition-all">
      <div class="absolute top-0 w-full h-1 opacity-80" [ngClass]="theme().bar"></div>

      <div class="pt-10 text-center">
        <div class="inline-flex p-4 rounded-full bg-[#0B0E14] mb-4 border border-white/5" [ngClass]="theme().icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-[#F1F5F9]">{{ title }}</h3>
      </div>

      <div class="flex-1 flex flex-col items-center justify-center w-full px-8">
        @if (presets && presets.length) {
          <div class="flex flex-wrap justify-center gap-2 mb-6">
            @for (p of presets; track p) {
              <button (click)="updateDuration(p)"
                      class="px-3 py-2 text-sm bg-[#0B0E14] text-[#94A3B8] border border-white/5 rounded-lg hover:bg-[#2A3441] hover:text-[#F1F5F9] transition-colors"
                      [class.ring-2]="duration() === p" [class.font-semibold]="duration() === p"
                      [class.ring-blue-500]="color === 'blue'"
                      [class.ring-orange-500]="color === 'orange'">
                {{ p }}s
              </button>
            }
          </div>
        } @else {
          <div class="flex items-center gap-4 mb-4">
            <button (click)="updateDuration(duration() - 5)" class="w-10 h-10 rounded-full bg-[#0B0E14] text-[#94A3B8] hover:bg-[#2A3441] hover:text-white font-bold border border-white/5 transition-colors">-</button>
            <input type="number" [value]="duration()" (input)="onDurationInput($event)"
                   class="w-20 text-center text-2xl font-bold bg-transparent border-b-2 border-[#2A3441] focus:border-[#3B82F6] outline-none text-[#F1F5F9]" />
            <button (click)="updateDuration(duration() + 5)" class="w-10 h-10 rounded-full bg-[#0B0E14] text-[#94A3B8] hover:bg-[#2A3441] hover:text-white font-bold border border-white/5 transition-colors">+</button>
          </div>
        }

        <div class="text-[4rem] font-bold font-mono tabular-nums text-[#F1F5F9] leading-none my-auto">
          {{ timeLeft() }}s
        </div>

        <div class="flex gap-4 w-full mt-auto pt-6">
          <button (click)="toggle()"
                  class="flex-1 py-3 rounded-lg font-bold text-white shadow-lg transition-all"
                  [ngClass]="isRunning() ? 'bg-red-500 hover:bg-red-600' : theme().btn + ' ' + theme().btnHover">
            {{ isRunning() ? 'Stop' : 'Start' }}
          </button>
          <button (click)="reset()" class="w-14 flex items-center justify-center bg-[#0B0E14] border border-white/5 rounded-lg text-[#94A3B8] hover:bg-[#2A3441] hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class TimerInstanceComponent implements OnDestroy {
  @Input() title = 'Timer';
  @Input() color = 'blue';
  @Input() defaultDuration = 60;
  @Input() presets: number[] = [];

  private audio = inject(AudioService);
  
  duration = signal(60);
  timeLeft = signal(60);
  isRunning = signal(false);
  
  private timerRef: any;

  ngOnInit() {
    this.duration.set(this.defaultDuration);
    this.timeLeft.set(this.defaultDuration);
  }

  theme() {
    if (this.color === 'orange') {
      return { bar: 'bg-orange-500', icon: 'text-orange-500', btn: 'bg-orange-600', btnHover: 'hover:bg-orange-500' };
    }
    return { bar: 'bg-[#3B82F6]', icon: 'text-[#3B82F6]', btn: 'bg-[#3B82F6]', btnHover: 'hover:bg-[#2563EB]' };
  }

  updateDuration(val: number) {
    const newDur = Math.max(1, val);
    this.duration.set(newDur);
    if (!this.isRunning()) {
      this.timeLeft.set(newDur);
    }
  }

  onDurationInput(e: any) {
    this.updateDuration(parseInt(e.target.value) || 0);
  }

  async toggle() {
    if (!this.isRunning()) await this.audio.resumeAudioContext();
    
    if (this.isRunning()) {
      this.isRunning.set(false);
      clearInterval(this.timerRef);
    } else {
      this.isRunning.set(true);
      this.timerRef = setInterval(() => {
        const t = this.timeLeft();
        if (t <= 1) {
          this.audio.playBeep(800, 0.2);
          this.timeLeft.set(this.duration()); // Loop
        } else {
          this.timeLeft.set(t - 1);
        }
      }, 1000);
    }
  }

  reset() {
    this.isRunning.set(false);
    clearInterval(this.timerRef);
    this.timeLeft.set(this.duration());
  }

  ngOnDestroy() {
    clearInterval(this.timerRef);
  }
}