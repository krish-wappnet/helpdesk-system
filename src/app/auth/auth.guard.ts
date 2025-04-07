import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '../store/state/app.state';
import { selectUser } from '../store/selectors/user.selector';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: Auth,
    private router: Router,
    private store: Store<AppState>
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.auth.onAuthStateChanged((user) => {
        if (!user) {
          // No authenticated user, redirect to login
          this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
          observer.next(false);
          observer.complete();
        } else {
          // User is authenticated, check role from NgRx store
          this.store.select(selectUser).pipe(
            take(1),
            map((userState) => {
              if (!userState) {
                // User not loaded in store yet, deny access
                this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
                return false;
              }

              const requiredRole = route.data['role'] as string; // Expected role from route data
              const userRole = userState.role;

              if (requiredRole && userRole !== requiredRole) {
                // Role mismatch, redirect to user's appropriate dashboard
                this.redirectBasedOnRole(userRole);
                return false;
              }

              return true; // User is authenticated and has the correct role
            })
          ).subscribe((canActivate) => {
            observer.next(canActivate);
            observer.complete();
          });
        }
      });
    });
  }

  private redirectBasedOnRole(role: string) {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin-dashboard']);
        break;
      case 'agent':
        this.router.navigate(['/agent-dashboard']);
        break;
      case 'user':
        this.router.navigate(['/tickets']);
        break;
      default:
        this.router.navigate(['/auth/login']);
    }
  }
}