import {Routes} from '@angular/router';
import {authGuard} from './auth/guard/auth-guard';
import {authMatchGuard} from './auth/guard/auth-match-guard';
import {guestGuard} from './auth/guard/guest-guard';
import {getDailyIntakeResolver} from './home/home-resolver';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canMatch: [authMatchGuard],
    loadComponent: () => import('./home/home').then(m => m.Home),
    resolve: {
      dailyIntake: getDailyIntakeResolver,
    },
  },
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./landing/landing').then(m => m.Landing),
  },
  {
    path: 'foods',
    loadComponent: () => import('./food/food').then(m => m.Food),
    canActivate: [authGuard],
  },
  {
    path: 'food-types',
    loadComponent: () => import('./food-type/food-type').then(m => m.FoodType),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.Login),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register').then(m => m.Register),
    canActivate: [guestGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
