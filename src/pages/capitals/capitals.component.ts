import { Component, OnDestroy, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AudioService } from '../../services/audio.service';

const EUROPE_CAPITALS = [
  { country: 'Albanien', capital: 'Tirana' },
  { country: 'Andorra', capital: 'Andorra la Vella' },
  { country: 'Österreich', capital: 'Wien' },
  { country: 'Weißrussland', capital: 'Minsk' },
  { country: 'Belgien', capital: 'Brüssel' },
  { country: 'Bosnien und Herzegowina', capital: 'Sarajevo' },
  { country: 'Bulgarien', capital: 'Sofia' },
  { country: 'Kroatien', capital: 'Zagreb' },
  { country: 'Zypern', capital: 'Nikosia' },
  { country: 'Tschechien', capital: 'Prag' },
  { country: 'Dänemark', capital: 'Kopenhagen' },
  { country: 'Estland', capital: 'Tallinn' },
  { country: 'Finnland', capital: 'Helsinki' },
  { country: 'Frankreich', capital: 'Paris' },
  { country: 'Deutschland', capital: 'Berlin' },
  { country: 'Griechenland', capital: 'Athen' },
  { country: 'Ungarn', capital: 'Budapest' },
  { country: 'Island', capital: 'Reykjavik' },
  { country: 'Irland', capital: 'Dublin' },
  { country: 'Italien', capital: 'Rom' },
  { country: 'Lettland', capital: 'Riga' },
  { country: 'Liechtenstein', capital: 'Vaduz' },
  { country: 'Litauen', capital: 'Vilnius' },
  { country: 'Luxemburg', capital: 'Luxemburg' },
  { country: 'Malta', capital: 'Valletta' },
  { country: 'Moldawien', capital: 'Chisinau' },
  { country: 'Monaco', capital: 'Monaco' },
  { country: 'Montenegro', capital: 'Podgorica' },
  { country: 'Niederlande', capital: 'Amsterdam' },
  { country: 'Nordmazedonien', capital: 'Skopje' },
  { country: 'Norwegen', capital: 'Oslo' },
  { country: 'Polen', capital: 'Warschau' },
  { country: 'Portugal', capital: 'Lissabon' },
  { country: 'Rumänien', capital: 'Bukarest' },
  { country: 'Russland', capital: 'Moskau' },
  { country: 'San Marino', capital: 'San Marino' },
  { country: 'Serbien', capital: 'Belgrad' },
  { country: 'Slowakei', capital: 'Bratislava' },
  { country: 'Slowenien', capital: 'Ljubljana' },
  { country: 'Spanien', capital: 'Madrid' },
  { country: 'Schweden', capital: 'Stockholm' },
  { country: 'Schweiz', capital: 'Bern' },
  { country: 'Türkei', capital: 'Ankara' },
  { country: 'Ukraine', capital: 'Kiew' },
  { country: 'Vereinigtes Königreich', capital: 'London' },
  { country: 'Vatikanstadt', capital: 'Vatikanstadt' }
];

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

@Component({
  selector: 'app-capitals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full h-full min-h-[60vh] flex flex-col items-center justify-center relative"
         [class]="status() !== 'config' ? 'fixed inset-0 z-40 bg-[#0B0E14]' : ''">

      <!-- CONFIG MODE -->
      @if (status() === 'config') {
        <div class="w-full max-w-md bg-[#151A23] rounded-3xl p-8 shadow-xl border border-white/5 text-center transition-all animate-enter">
          <div class="w-20 h-20 bg-[#0B0E14] rounded-full flex items-center justify-center mx-auto mb-6 text-[#3B82F6] border border-white/5 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </div>

          <h1 class="text-2xl font-bold text-[#F1F5F9] mb-2">Hauptstädte Quiz</h1>
          <p class="text-[#94A3B8] mb-8">Teste dein Wissen über die europäischen Hauptstädte.</p>

          <div class="space-y-6 mb-8 text-left">
            <!-- Speed -->
            <div class="bg-[#0B0E14] border border-white/5 p-4 rounded-xl">
              <div class="flex justify-between items-center mb-2">
                <label class="font-bold text-[#94A3B8] text-sm uppercase tracking-wider">Geschwindigkeit (Sekunden)</label>
                <span class="font-mono text-[#F1F5F9] font-bold">{{ speed() }}s</span>
              </div>
              <input type="range" min="1" max="10" step="1"
                     [ngModel]="speed()" (ngModelChange)="speed.set($event)"
                     class="w-full h-2 bg-[#2A3441] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]" />
            </div>
            <!-- Steps -->
            <div class="bg-[#0B0E14] border border-white/5 p-4 rounded-xl">
              <div class="flex justify-between items-center mb-2">
                <label class="font-bold text-[#94A3B8] text-sm uppercase tracking-wider">Anzahl (Schritte)</label>
                <span class="font-mono text-[#F1F5F9] font-bold">{{ steps() }}</span>
              </div>
              <input type="range" min="5" max="45" step="5"
                     [ngModel]="steps()" (ngModelChange)="steps.set($event)"
                     class="w-full h-2 bg-[#2A3441] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]" />
            </div>
          </div>

          <button (click)="startGame()"
                  class="w-full py-4 rounded-xl bg-[#3B82F6] text-white font-bold hover:bg-[#2563EB] hover-spring shadow-lg transition-colors">
            Quiz Starten
          </button>
        </div>
      }

      <!-- PLAYING MODE (Normal View) -->
      @if (status() === 'playing' && viewMode() === 'normal') {
        <div class="w-full h-full flex flex-col items-center justify-center p-4 text-center animate-enter">
          <!-- Progress Bar -->
          <div class="absolute top-0 left-0 w-full h-1 bg-[#2A3441]">
            <div class="h-1 bg-[#3B82F6] transition-all duration-300" [style.width.%]="progress()"></div>
          </div>

          <!-- Controls -->
          <div class="absolute top-6 right-6 flex gap-2 z-50">
            <button (click)="viewMode.set('fullscreen')" class="p-3 bg-[#151A23]/80 backdrop-blur-sm rounded-full text-[#94A3B8] hover:text-white transition-colors border border-white/10" title="Vollbild">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
            </button>
             <button (click)="stopGame()" class="p-3 bg-[#151A23]/80 backdrop-blur-sm rounded-full text-[#94A3B8] hover:text-white transition-colors border border-white/10" title="Stopp">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
            </button>
          </div>
          
          <div class="flex flex-col items-center justify-center flex-1 relative">
            <p class="text-xl md:text-2xl text-[#94A3B8] mb-4">Was ist die Hauptstadt von</p>
            <h2 class="text-4xl md:text-7xl font-black text-center text-[#F1F5F9] mb-8 min-h-[100px] md:min-h-[180px] flex items-center">
              {{ currentQuestion().country }}
            </h2>

            @if (showAnswer()) {
              <div class="animate-enter-scale">
                <p class="text-lg md:text-xl text-[#64748B] mb-2">Die Hauptstadt ist</p>
                <h3 class="text-3xl md:text-5xl font-bold text-[#10B981]">{{ currentQuestion().capital }}</h3>
              </div>
            } @else {
              <div class="h-[84px] md:h-[116px]">
                  <!-- Empty placeholder for layout stability -->
              </div>
            }
          </div>

          <div class="text-lg font-bold text-[#64748B] tabular-nums">
            {{ currentStep() + 1 }} / {{ steps() }}
          </div>
        </div>
      }

      <!-- FINISHED MODE -->
      @if (status() === 'finished') {
        <div class="w-full max-w-md flex flex-col items-center justify-center text-center animate-enter-scale">
           <div class="text-7xl mb-6">🎉</div>
           <h2 class="text-3xl font-bold text-[#F1F5F9]">Quiz Beendet!</h2>
           <p class="text-[#94A3B8] mt-2 mb-8">Gut gemacht! Du hast alle {{ steps() }} Schritte abgeschlossen.</p>

           <div class="flex gap-4">
             <button (click)="stopGame()" class="px-6 py-3 rounded-xl bg-[#2A3441] text-[#94A3B8] font-bold hover:bg-[#334155] transition-colors">
               Einstellungen
             </button>
             <button (click)="startGame()" class="px-8 py-3 rounded-xl bg-[#3B82F6] text-white font-bold hover:bg-[#2563EB] transition-colors">
               Neustart
             </button>
           </div>
        </div>
      }
    </div>

    <!-- FULLSCREEN OVERLAY -->
    @if (status() === 'playing' && viewMode() === 'fullscreen') {
      <div class="fixed inset-0 z-50 bg-[#0B0E14] flex flex-col items-center justify-center animate-enter p-4">
        <!-- Exit Fullscreen Button -->
        <button (click)="viewMode.set('normal')" class="absolute top-6 right-6 p-4 bg-[#151A23] rounded-full text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#2A3441] transition-all shadow-sm border border-white/5 z-50">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <polyline points="4 14 10 14 10 20"></polyline>
             <polyline points="20 10 14 10 14 4"></polyline>
             <line x1="14" y1="10" x2="21" y2="3"></line>
             <line x1="3" y1="21" x2="10" y2="14"></line>
           </svg>
        </button>

        <!-- Content -->
        <div class="flex flex-col items-center justify-center text-center relative w-full">
            <p class="text-[3vw] lg:text-3xl text-[#94A3B8] mb-4">Was ist die Hauptstadt von</p>
            <h2 class="text-[10vw] lg:text-9xl font-black text-[#F1F5F9] leading-none">
              {{ currentQuestion().country }}
            </h2>

            @if (showAnswer()) {
              <div class="mt-12 animate-enter-scale">
                <h3 class="text-[8vw] lg:text-8xl font-bold text-[#10B981] leading-none">{{ currentQuestion().capital }}</h3>
              </div>
            }
        </div>
      </div>
    }
  `
})
export class CapitalsComponent implements OnDestroy {
  private audio = inject(AudioService);

  // Config
  speed = signal(this.loadNumber('capitals_speed', 4));
  steps = signal(this.loadNumber('capitals_steps', 10));
  // Removed voice config

  // State
  status = signal<'config' | 'playing' | 'finished'>('config');
  viewMode = signal<'normal' | 'fullscreen'>('normal');
  currentStep = signal(0);
  showAnswer = signal(false);
  progress = signal(0);
  currentQuestion = signal({ country: '', capital: '' });

  private shuffledData: { country: string; capital: string; }[] = [];
  private timerRef: any = null;
  private answerTimeoutRef: any = null;

  constructor() {
    effect(() => localStorage.setItem('capitals_speed', String(this.speed())));
    effect(() => localStorage.setItem('capitals_steps', String(this.steps())));
  }

  private loadNumber(key: string, def: number): number {
    return parseInt(localStorage.getItem(key) || String(def), 10);
  }
  
  private loadBoolean(key: string, def: boolean): boolean {
    return localStorage.getItem(key) !== null ? localStorage.getItem(key) === 'true' : def;
  }

  async startGame() {
    await this.audio.resumeAudioContext();
    this.shuffledData = shuffleArray(EUROPE_CAPITALS);
    this.currentStep.set(0);
    this.status.set('playing');
    this.viewMode.set('normal');
    
    this.runCurrentStep();
  }

  stopGame() {
    this.clearTimers();
    this.status.set('config');
    this.viewMode.set('normal');
  }

  private runCurrentStep() {
    if (this.currentStep() >= this.steps()) {
      this.finishGame();
      return;
    }
    
    this.clearTimers();
    this.progress.set((this.currentStep() / this.steps()) * 100);
    this.currentQuestion.set(this.shuffledData[this.currentStep()]);
    this.showAnswer.set(false);

    this.answerTimeoutRef = setTimeout(() => {
      this.showAnswer.set(true);
      this.audio.playBeep(800, 0.1, 0.1);
    }, (this.speed() * 1000) / 2);

    this.timerRef = setTimeout(() => {
      this.currentStep.update(s => s + 1);
      this.runCurrentStep();
    }, this.speed() * 1000);
  }

  private finishGame() {
    this.clearTimers();
    this.progress.set(100);
    this.status.set('finished');
    this.audio.playBeep(1200, 0.2, 0.2);
  }

  private clearTimers() {
    if (this.timerRef) clearTimeout(this.timerRef);
    if (this.answerTimeoutRef) clearTimeout(this.answerTimeoutRef);
  }

  ngOnDestroy() {
    this.clearTimers();
  }
}