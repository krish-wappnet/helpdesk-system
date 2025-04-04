import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';
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
  ): Observable<boolean> | Promise<boolean> | boolean {
    return new Promise((resolve) => {
      this.auth.onAuthStateChanged((user) => {
        if (user) {
          this.store.select(selectUser).pipe(
            take(1),
            map(userState => {
              if (userState) {
                resolve(true);
              } else {
                this.router.navigate(['/auth/login']);
                resolve(false);
              }
            })
          ).subscribe();
        } else {
          this.router.navigate(['/auth/login']);
          resolve(false);
        }
      });
    });
  }
}