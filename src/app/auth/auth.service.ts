import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Store } from '@ngrx/store';
import { AppState, User } from '../store/state/app.state';
import * as UserActions from '../store/actions/user.action';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private store: Store<AppState>,
    private router: Router
  ) {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        const userDocRef = doc(this.firestore, 'users', user.uid);
        getDoc(userDocRef).then((docSnap) => {
          let userData: User;
          if (docSnap.exists()) {
            userData = docSnap.data() as User;
          } else {
            userData = { uid: user.uid, email: user.email!, role: 'user' };
            setDoc(userDocRef, userData);
          }
          this.store.dispatch(UserActions.loadUserSuccess({
            user: { uid: user.uid, email: user.email!, role: userData.role }
          }));
          // Redirect based on role after loading user
          this.redirectBasedOnRole(userData.role);
        }).catch((error) => {
          console.error('Error fetching user data:', error);
          this.store.dispatch(UserActions.loadUserFailure({ error }));
        });
      } else {
        this.store.dispatch(UserActions.clearUser());
        this.router.navigate(['/login']);
      }
    });
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw error;
    }
  }

  async signup(email: string, password: string, role: string): Promise<void> {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = result.user;
      if (user) {
        const userDocRef = doc(this.firestore, 'users', user.uid);
        const userData: User = { uid: user.uid, email, role: role === 'agent' ? 'agent' : 'user' };
        await setDoc(userDocRef, userData);
        this.store.dispatch(UserActions.loadUserSuccess({
          user: { uid: user.uid, email: user.email!, role: userData.role }
        }));
        this.redirectBasedOnRole(userData.role);
      }
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.store.dispatch(UserActions.clearUser());
    } catch (error) {
      throw error;
    }
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
        this.router.navigate(['/tickets/my-tickets']);
        break;
      default:
        this.router.navigate(['/auth/login']);
    }
  }
}