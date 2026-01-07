import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimerInstanceComponent } from '../../components/timers/timer-instance.component';
import { SequenceTimerComponent } from '../../components/timers/sequence-timer.component';
import { SequenceBuilderComponent } from '../../components/timers/sequence-builder.component';

@Component({
  selector: 'app-timers',
  standalone: true,
  imports: [CommonModule, TimerInstanceComponent, SequenceTimerComponent, SequenceBuilderComponent],
  template: `
    <div class="animate-enter">
      <div class="flex flex-col items-center mb-12 relative">
        <h1 class="text-3xl font-bold text-center text-[#F1F5F9]">Timers</h1>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <!-- Standard Timers -->
        <app-timer-instance class="animate-enter opacity-0" style="animation-delay: 0ms" title="Custom Timer" color="blue" [defaultDuration]="60"></app-timer-instance>
        <app-timer-instance class="animate-enter opacity-0" style="animation-delay: 100ms" title="Presets" color="orange" [defaultDuration]="30" [presets]="[15, 30, 45, 60]"></app-timer-instance>

        <!-- Saved Sequences -->
        @for (seq of sequences(); track seq.id; let i = $index) {
          <app-sequence-timer [style.animation-delay]="(200 + i * 100) + 'ms'" class="animate-enter opacity-0" [sequence]="seq" (onDelete)="deleteSequence($event)"></app-sequence-timer>
        }

        <!-- Add Sequence Card -->
        <button (click)="showBuilder.set(true)"
                [style.animation-delay]="(200 + sequences().length * 100) + 'ms'"
                class="animate-enter opacity-0 relative bg-[#151A23] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center min-h-[420px] text-[#94A3B8] hover:border-[#3B82F6] hover:text-[#3B82F6] hover:bg-[#151A23]/50 transition-all group hover-spring">
          <div class="w-16 h-16 rounded-full bg-[#0B0E14] border border-white/5 group-hover:bg-[#3B82F6]/10 flex items-center justify-center mb-4 transition-colors">
            <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <h3 class="text-xl font-bold">Create Sequence</h3>
          <p class="text-sm opacity-70 mt-2">Build a custom loop of timers</p>
        </button>
      </div>

      <!-- Builder Modal -->
      @if (showBuilder()) {
        <app-sequence-builder (onClose)="showBuilder.set(false)" (onSave)="addSequence($event)"></app-sequence-builder>
      }
    </div>
  `
})
export class TimersComponent {
  sequences = signal<any[]>([]);
  showBuilder = signal(false);

  constructor() {
    const saved = localStorage.getItem('app_timer_sequences');
    if (saved) {
      try {
        this.sequences.set(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse sequences from localStorage", e);
      }
    }

    effect(() => {
      localStorage.setItem('app_timer_sequences', JSON.stringify(this.sequences()));
    });
  }

  addSequence(seq: any) {
    this.sequences.update(curr => [...curr, seq]);
    this.showBuilder.set(false);
  }

  deleteSequence(id: string) {
    if (confirm('Delete this sequence?')) {
      this.sequences.update(curr => curr.filter(s => s.id !== id));
    }
  }
}