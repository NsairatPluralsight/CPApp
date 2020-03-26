import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CounterLCDComponent } from '../counter-lcd/counter-lcd.component';
import { MainLCDComponent } from '../main-lcd/main-lcd.component';
import { CVMComponentsComponent } from '../cvm-components/cvm-components.component';
import { LoginComponent } from '../login/login.component';
import { ErrorComponent } from '../error/error.component';
import { DefenderGuard } from './defender.guard';

const routes: Routes = [
  { path: 'counterlcd/:pid',  component: CounterLCDComponent, canActivate: [DefenderGuard] },
  { path: 'mainlcd/:pid',  component: MainLCDComponent, canActivate: [DefenderGuard] },
  { path: 'devices',  component: CVMComponentsComponent, canActivate: [DefenderGuard] },
  { path: 'signin',  component: LoginComponent, canActivate: [DefenderGuard] },
  { path: 'error', component: ErrorComponent},
  { path: '', redirectTo: 'signin', pathMatch: 'full' },
  { path: '**', redirectTo: 'signin', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})

export class AppRoutingModule { }
