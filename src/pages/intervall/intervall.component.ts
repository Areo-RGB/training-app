import { Component, OnDestroy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-intervall',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-[60vh] animate-enter">
      <div class="w-full max-w-md bg-[#151A23] rounded-3xl p-8 shadow-xl border border-white/5 text-center transition-all">
        <div class="w-20 h-20 bg-[#0B0E14] rounded-full flex items-center justify-center mx-auto mb-6 text-[#3B82F6] border border-white/5 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v20" />
            <path d="M2 12h20" />
            <path d="M12 2a10 10 0 0 1 10 10" />
            <path d="M2 12a10 10 0 0 1 10-10" />
          </svg>
        </div>

        <h1 class="text-2xl font-bold text-[#F1F5F9] mb-2">Intervall</h1>
        <p class="text-[#94A3B8] mb-8">Periodic audio cues for training.</p>

        <div class="space-y-6 mb-8 text-left">
          <div>
            <label class="block text-sm font-bold text-[#94A3B8] mb-4 uppercase tracking-wider text-center">
              Interval (Seconds)
            </label>
            <div class="flex items-center justify-center gap-6">
              <button
                (click)="adjustInterval(-0.5)"
                class="w-12 h-12 flex items-center justify-center rounded-xl bg-[#0B0E14] border border-white/10 hover:bg-[#2A3441] font-bold text-xl transition-colors btn-press text-[#F1F5F9]">
                -
              </button>
              <input
                type="number"
                [ngModel]="intervalSec()"
                (ngModelChange)="setIntervalSec($event)"
                class="w-32 text-center text-3xl font-black bg-transparent border-b-2 border-[#2A3441] focus:border-[#3B82F6] outline-none py-2 text-[#F1F5F9]"
              />
              <button
                (click)="adjustInterval(0.5)"
                class="w-12 h-12 flex items-center justify-center rounded-xl bg-[#0B0E14] border border-white/10 hover:bg-[#2A3441] font-bold text-xl transition-colors btn-press text-[#F1F5F9]">
                +
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-[#94A3B8] mb-2 uppercase tracking-wider">
              Auto-Stop Limit (Optional)
            </label>
            <input
              type="number"
              [ngModel]="limitSec()"
              (ngModelChange)="limitSec.set($event)"
              placeholder="Seconds (e.g. 60)"
              class="w-full p-4 rounded-xl bg-[#0B0E14] border border-white/10 focus:border-[#3B82F6] outline-none font-bold text-[#F1F5F9] transition-all placeholder:font-normal placeholder:text-gray-600"
            />
          </div>

          <div
            class="flex items-center justify-between p-4 bg-[#0B0E14] border border-white/5 rounded-xl cursor-pointer hover:bg-[#2A3441] transition-colors btn-press"
            (click)="toggleVolumeBoost()"
          >
            <span class="font-semibold text-[#F1F5F9]">Volume Boost</span>
            <div
              class="w-12 h-7 rounded-full transition-colors relative"
              [class]="volumeBoost() ? 'bg-[#3B82F6]' : 'bg-[#2A3441]'"
            >
              <div
                class="w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform"
                [class]="volumeBoost() ? 'left-6' : 'left-1'"
              ></div>
            </div>
          </div>
        </div>

        <button
          (click)="toggle()"
          class="w-full py-4 rounded-xl text-lg font-bold text-white shadow-lg transform transition-all hover-spring"
          [class]="isRunning() ? 'bg-red-500 hover:bg-red-600' : 'bg-[#3B82F6] hover:bg-[#2563EB]'"
        >
          {{ isRunning() ? 'Stop' : 'Start Timer' }}
        </button>
      </div>
    </div>
  `
})
export class IntervallComponent implements OnDestroy {
  private audio = inject(AudioService);

  intervalSec = signal(2);
  limitSec = signal<string>('');
  isRunning = signal(false);
  volumeBoost = signal(false);

  private timerRef: any = null;
  private limitTimerRef: any = null;

  adjustInterval(amount: number) {
    this.intervalSec.update(v => Math.max(0.1, parseFloat((v + amount).toFixed(1))));
  }
  
  setIntervalSec(val: any) {
    const num = parseFloat(val);
    this.intervalSec.set(isNaN(num) ? 0.1 : Math.max(0.1, num));
  }

  toggleVolumeBoost() {
    this.volumeBoost.update(v => !v);
  }

  play() {
    const vol = this.volumeBoost() ? 0.8 : 0.15;
    this.audio.playBeep(600, 0.15, vol);
  }

  async start() {
    await this.audio.resumeAudioContext();
    this.isRunning.set(true);
    this.play();

    this.timerRef = setInterval(() => this.play(), this.intervalSec() * 1000);

    const limit = parseInt(this.limitSec() || '0', 10);
    if (limit > 0) {
      this.limitTimerRef = setTimeout(() => {
        this.stop();
      }, limit * 1000);
    }
  }

  stop() {
    this.isRunning.set(false);
    if (this.timerRef) clearInterval(this.timerRef);
    if (this.limitTimerRef) clearTimeout(this.limitTimerRef);
  }

  toggle() {
    if (this.isRunning()) this.stop();
    else this.start();
  }

  ngOnDestroy() {
    this.stop();
  }
}