import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  { 
    path: 'tickets', 
    loadChildren: () => import('./tickets/tickets.module').then(m => m.TicketsModule),
    canActivate: [AuthGuard]
  },
  { 
    path: 'dashboard', 
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  { 
    path: 'admin', 
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'auth/login' }
];