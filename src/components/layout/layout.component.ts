import { Component, ViewChild, ElementRef } from '@angular/core';
import { RouterLink, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { signal } from '@angular/core';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <div #scrollContainer class="h-full w-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#0B0E14] text-[#F1F5F9] font-sans antialiased selection:bg-[#3B82F6] selection:text-white relative scroll-smooth">
      
      <!-- Ambient Background -->
      <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div class="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-blue-900/10 rounded-full blur-[100px]"></div>
        <div class="absolute -bottom-[10%] -right-[10%] w-[50vw] h-[50vw] bg-indigo-900/10 rounded-full blur-[100px]"></div>
      </div>

      <!-- Navbar (Hidden on Home for clean look, or keep minimal) -->
      @if (!isHome()) {
        <nav class="w-full bg-[#0B0E14]/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5 py-4 mb-4 animate-enter">
          <div class="max-w-4xl mx-auto px-6 flex items-center gap-4">
            <a routerLink="/" class="flex items-center gap-3 group cursor-pointer text-[#F1F5F9] hover:text-[#3B82F6] transition-colors select-none">
              <div class="text-[#3B82F6] group-hover:-translate-x-1 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 12H5"/>
                  <path d="M12 19l-7-7 7-7"/>
                </svg>
              </div>
              <h1 class="text-sm font-semibold tracking-wide uppercase text-[#94A3B8] group-hover:text-[#F1F5F9]">
                Zurück zum Menü
              </h1>
            </a>
          </div>
        </nav>
      }

      <!-- Main Content -->
      <main class="relative flex-1 max-w-4xl mx-auto w-full px-6 py-8 pb-20">
        <ng-content></ng-content>
      </main>

      <!-- Scroll Controls -->
      <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-3 animate-enter delay-500 opacity-0">
        <button (click)="scroll(-1)" class="p-3 bg-[#151A23]/90 backdrop-blur-sm border border-white/10 rounded-full text-[#94A3B8] hover:text-white hover:bg-[#3B82F6] hover:border-[#3B82F6] shadow-lg transition-all hover-spring group" aria-label="Scroll Up">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:-translate-y-0.5 transition-transform">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
        <button (click)="scroll(1)" class="p-3 bg-[#151A23]/90 backdrop-blur-sm border border-white/10 rounded-full text-[#94A3B8] hover:text-white hover:bg-[#3B82F6] hover:border-[#3B82F6] shadow-lg transition-all hover-spring group" aria-label="Scroll Down">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:translate-y-0.5 transition-transform">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
    </div>
  `
})
export class LayoutComponent {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  isHome = signal(true);

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isHome.set(event.url === '/' || event.url === '');
    });
  }

  scroll(direction: number) {
    if (this.scrollContainer?.nativeElement) {
      // Scroll by 60% of the viewport height for a comfortable "page" scroll
      const scrollAmount = window.innerHeight * 0.6; 
      this.scrollContainer.nativeElement.scrollBy({
        top: scrollAmount * direction,
        behavior: 'smooth'
      });
    }
  }
}