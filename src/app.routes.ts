import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { IntervallComponent } from './pages/intervall/intervall.component';
import { FarbenComponent } from './pages/farben/farben.component';
import { KettenrechnerComponent } from './pages/kettenrechner/kettenrechner.component';
import { TimersComponent } from './pages/timers/timers.component';
import { SoundCounterComponent } from './pages/sound-counter/sound-counter.component';
import { CapitalsComponent } from './pages/capitals/capitals.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'intervall', component: IntervallComponent },
  { path: 'farben', component: FarbenComponent },
  { path: 'kettenrechner', component: KettenrechnerComponent },
  { path: 'timers', component: TimersComponent },
  { path: 'sound-counter', component: SoundCounterComponent },
  { path: 'capitals', component: CapitalsComponent },
  { path: '**', redirectTo: '' }
];