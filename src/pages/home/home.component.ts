import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="flex flex-col gap-8 py-6 animate-enter">
      
      <!-- Header -->
      <div class="text-center space-y-2 mb-2">
        <h1 class="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
          Training
        </h1>
        <p class="text-[#94A3B8] text-xs md:text-sm font-medium tracking-wide uppercase">
          Training Tools
        </p>
      </div>

      <!-- Tools Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        @for (tool of tools; track tool.title; let i = $index) {
          <a [routerLink]="tool.link"
             [style.animation-delay]="(i * 50) + 'ms'"
             class="group relative overflow-hidden rounded-xl bg-[#151A23] border border-white/5 hover:border-white/10 transition-all hover-spring animate-enter opacity-0 cursor-pointer h-full">
            
            <!-- Left Accent Border -->
            <div [class]="'absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b group-hover:w-1.5 transition-all ' + tool.accentGradient"></div>

            <div class="flex items-start p-4 gap-4 h-full">
              <!-- Icon Box -->
              <div [class]="'w-10 h-10 rounded-lg bg-[#0B0E14] border border-white/5 flex items-center justify-center text-[#64748B] transition-colors shrink-0 mt-0.5 ' + tool.hoverColor">
                 @if (tool.icon === 'timers') {
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                }
                @if (tool.icon === 'farben') {
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                }
                @if (tool.icon === 'kettenrechner') {
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>
                }
                @if (tool.icon === 'intervall') {
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M2 12h20"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M2 12a10 10 0 0 1 10-10"/></svg>
                }
                @if (tool.icon === 'sound-counter') {
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                }
                 @if (tool.icon === 'capitals') {
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                }
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0 flex flex-col h-full justify-between">
                <div>
                  <h3 [class]="'text-base font-bold text-[#F1F5F9] mb-1 transition-colors truncate leading-tight ' + tool.hoverColor">
                    {{ tool.title }}
                  </h3>
                  <p class="text-xs text-[#94A3B8] leading-relaxed line-clamp-2 mb-2">
                    {{ tool.description }}
                  </p>
                </div>
                
                <!-- Tags -->
                <div class="flex flex-wrap gap-1.5 mt-auto">
                  @for (tag of tool.tags; track tag) {
                    <span class="px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold tracking-wider bg-[#0B0E14] text-[#64748B] border border-white/5 uppercase">
                      {{ tag }}
                    </span>
                  }
                </div>
              </div>
            </div>
          </a>
        }
      </div>
    </div>
  `
})
export class HomeComponent {
  tools = [
    {
      title: 'Sound-Zähler',
      description: 'Erhöht einen Zähler, wenn der Geräuschpegel einen Schwellenwert überschreitet.',
      link: '/sound-counter',
      icon: 'sound-counter',
      tags: ['AUDIO', 'TRIGGER'],
      accentGradient: 'from-blue-500 to-indigo-600',
      hoverColor: 'group-hover:text-blue-500'
    },
    {
      title: 'Farben',
      description: 'Stroop-Effekt-Trainer. Farben und Wörter blinken, um die Reaktionsgeschwindigkeit zu verbessern.',
      link: '/farben',
      icon: 'farben',
      tags: ['KOGNITIV', 'REAKTION'],
      accentGradient: 'from-pink-500 to-rose-600',
      hoverColor: 'group-hover:text-pink-500'
    },
    {
      title: 'Kettenrechner',
      description: 'Kopfrechnen-Kettenaufgaben. Löse fortlaufende Rechenoperationen.',
      link: '/kettenrechner',
      icon: 'kettenrechner',
      tags: ['MATHE', 'FOKUS'],
      accentGradient: 'from-emerald-500 to-green-600',
      hoverColor: 'group-hover:text-emerald-500'
    },
    {
      title: 'Timer',
      description: 'Intervall-Timer und Schleifen-Voreinstellungen für verschiedene Trainingseinheiten.',
      link: '/timers',
      icon: 'timers',
      tags: ['WERKZEUG', 'INTERVALL'],
      accentGradient: 'from-orange-500 to-amber-600',
      hoverColor: 'group-hover:text-orange-500'
    },
    {
      title: 'Intervall',
      description: 'Setze benutzerdefinierte Intervalle für Audio-Erinnerungen.',
      link: '/intervall',
      icon: 'intervall',
      tags: ['AUDIO', 'TAKT'],
      accentGradient: 'from-purple-500 to-violet-600',
      hoverColor: 'group-hover:text-purple-500'
    },
    {
      title: 'Hauptstädte Quiz',
      description: 'Teste dein Wissen über europäische Hauptstädte mit diesem Zeit-Quiz.',
      link: '/capitals',
      icon: 'capitals',
      tags: ['GEOGRAPHIE', 'GEDÄCHTNIS'],
      accentGradient: 'from-cyan-500 to-teal-600',
      hoverColor: 'group-hover:text-cyan-500'
    }
  ];
}