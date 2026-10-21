import {Routes} from '@angular/router';
import {authGuard} from './auth/guard/auth-guard';
import {guestGuard} from './auth/guard/guest-guard';
import {getDailyIntakeResolver} from './home/home-resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then(m => m.Home),
    canActivate: [authGuard],
    resolve: {
      dailyIntake: getDailyIntakeResolver
    }
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.Login),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register').then(m => m.Register),
    canActivate: [guestGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
