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
            // New user (e.g., from Google), set default role
            userData = { uid: user.uid, email: user.email!, role: 'user' }; // Default to user
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

  async signup(email: string, password: string): Promise<void> {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = result.user;
      if (user) {
        const userDocRef = doc(this.firestore, 'users', user.uid);
        await setDoc(userDocRef, { email, role: 'user' }); // Assign user role
      }
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      throw error;
    }
  }
}