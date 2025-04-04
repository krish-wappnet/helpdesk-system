import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Store } from '@ngrx/store';
import { AppState, User } from '../store/state/app.state';
import * as UserActions from '../store/actions/user.action';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private store: Store<AppState>
  ) {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        const userDocRef = doc(this.firestore, 'users', user.uid);
        getDoc(userDocRef).then((docSnap) => {
          let userData: User;
          if (docSnap.exists()) {
            userData = docSnap.data() as User;
          } else {
            // Default to 'user' role if no document exists (this won't override signup role)
            userData = { uid: user.uid, email: user.email!, role: 'user' };
            setDoc(userDocRef, userData);
          }
          this.store.dispatch(UserActions.loadUserSuccess({
            user: { uid: user.uid, email: user.email!, role: userData.role }
          }));
        }).catch((error) => {
          console.error('Error fetching user data:', error);
          this.store.dispatch(UserActions.loadUserFailure({ error }));
        });
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
        // Store the selected role (user or agent) during signup
        const userData: User = { uid: user.uid, email, role: role === 'agent' ? 'agent' : 'user' };
        await setDoc(userDocRef, userData);
        // Dispatch the user data to the store immediately after signup
        this.store.dispatch(UserActions.loadUserSuccess({
          user: { uid: user.uid, email: user.email!, role: userData.role }
        }));
      }
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      // Optionally clear the user from the store on logout
      this.store.dispatch(UserActions.clearUser());
    } catch (error) {
      throw error;
    }
  }
}