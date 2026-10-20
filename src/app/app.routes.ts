import {Routes} from '@angular/router';
import {guestGuard} from './auth/guard/guest-guard';

export const routes: Routes = [
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
