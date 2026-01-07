import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sequence-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-enter opacity-0">
      <div class="w-full max-w-lg bg-[#1E2532] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/10 animate-enter-scale opacity-0">
        <div class="p-6 border-b border-white/5 flex justify-between items-center bg-[#2A3441]/50">
          <h2 class="text-xl font-bold text-[#F1F5F9]">Create Sequence</h2>
          <button (click)="onClose.emit()" class="text-[#94A3B8] hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="p-6 overflow-y-auto flex-1">
          <div class="mb-6">
            <label class="block text-sm font-semibold text-[#94A3B8] mb-2">Sequence Name</label>
            <input [(ngModel)]="name" placeholder="e.g. HIIT Workout" class="w-full p-3 rounded-xl bg-[#151A23] border border-white/10 focus:border-[#3B82F6] outline-none transition-all text-white" />
          </div>

          <div class="mb-6">
            <label class="block text-sm font-semibold text-[#94A3B8] mb-2">Add Timer Step</label>
            <div class="flex gap-4 items-center bg-[#151A23] p-3 rounded-xl border border-white/5">
              <button (click)="adjustDuration(-5)" class="w-10 h-10 rounded-lg bg-[#2A3441] hover:bg-[#334155] font-bold text-xl text-white">-</button>
              <div class="flex-1 text-center font-mono text-2xl font-bold text-white">{{ currentDuration() }}s</div>
              <button (click)="adjustDuration(5)" class="w-10 h-10 rounded-lg bg-[#2A3441] hover:bg-[#334155] font-bold text-xl text-white">+</button>
              <button (click)="addStep()" class="bg-[#3B82F6] text-white p-3 rounded-lg hover:bg-[#2563EB] transition-colors flex items-center gap-2">
                <span>Add</span>
              </button>
            </div>
          </div>

          <div class="mb-6 bg-[#151A23] p-4 rounded-xl flex flex-col gap-4 border border-white/5">
            <div class="flex items-center justify-between cursor-pointer" (click)="toggleLoop()">
              <span class="font-semibold text-[#94A3B8]">Loop Sequence</span>
              <button class="w-12 h-7 rounded-full transition-colors relative" [class]="loop() ? 'bg-[#3B82F6]' : 'bg-[#2A3441]'">
                <div class="w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform" [class]="loop() ? 'left-6' : 'left-1'"></div>
              </button>
            </div>
            @if(loop()) {
               <div class="animate-enter border-t border-white/5 pt-4">
                 <label class="block text-sm font-semibold text-[#94A3B8] mb-2">Loop Count (empty = infinite)</label>
                 <input type="number" [(ngModel)]="loopCount" placeholder="∞" class="w-full p-3 rounded-xl bg-[#2A3441] border border-white/10 focus:border-[#3B82F6] outline-none text-white" />
               </div>
            }
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-[#94A3B8]">Sequence Steps ({{ steps().length }})</label>
            @if(steps().length === 0) {
              <div class="text-center py-8 text-[#94A3B8] bg-[#151A23]/50 rounded-xl border-2 border-dashed border-white/10">No steps added yet</div>
            }
            @for (step of steps(); track step.id; let i = $index) {
              <div class="flex items-center justify-between p-3 bg-[#151A23] border border-white/5 rounded-xl animate-enter opacity-0">
                <div class="flex items-center gap-3">
                  <span class="w-6 h-6 rounded-full bg-[#2A3441] flex items-center justify-center text-xs font-bold text-[#94A3B8]">{{ i + 1 }}</span>
                  <span class="font-mono font-bold text-lg text-white">{{ step.duration }}s</span>
                </div>
                <button (click)="removeStep(i)" class="text-[#94A3B8] hover:text-red-400 p-2">Delete</button>
              </div>
            }
          </div>
        </div>

        <div class="p-6 border-t border-white/5 bg-[#2A3441]/50 flex justify-end gap-3">
          <button (click)="onClose.emit()" class="px-6 py-3 rounded-xl font-medium text-[#94A3B8] hover:bg-[#334155]">Cancel</button>
          <button (click)="handleSave()" [disabled]="!name() || steps().length === 0" class="px-6 py-3 rounded-xl font-medium text-white bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 disabled:bg-gray-500">Save Sequence</button>
        </div>
      </div>
    </div>
  `
})
export class SequenceBuilderComponent {
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<any>();

  name = signal('');
  currentDuration = signal(30);
  steps = signal<any[]>([]);
  loop = signal(false);
  loopCount = signal<string>('');
  
  Math = Math; // Template access

  adjustDuration(delta: number) {
    this.currentDuration.update(v => Math.max(5, v + delta));
  }

  toggleLoop() {
    this.loop.update(v => !v);
  }

  addStep() {
    this.steps.update(s => [...s, { id: Date.now() + Math.random(), duration: this.currentDuration() }]);
  }

  removeStep(idx: number) {
    this.steps.update(s => s.filter((_, i) => i !== idx));
  }

  handleSave() {
    if (!this.name() || this.steps().length === 0) return;
    this.onSave.emit({
      id: Date.now().toString(),
      name: this.name(),
      steps: this.steps(),
      loop: this.loop(),
      loopCount: this.loop() && this.loopCount() ? parseInt(this.loopCount(), 10) : 0
    });
  }
}