import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Auth, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  loading = false; // For login button spinner
  hidePassword = true; // For password visibility toggle

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private auth: Auth
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.loginForm.reset();
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage = null;
    this.loading = true; // Show spinner
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password)
      .then(() => {
        this.router.navigate(['/tickets']);
      })
      .catch((error: any) => {
        this.handleFirebaseError(error);
      })
      .finally(() => {
        this.loading = false; // Hide spinner
      });
  }

  loginWithGoogle() {
    this.errorMessage = null;
    this.loading = true; // Show spinner for Google login
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.auth, provider)
      .then(() => {
        this.router.navigate(['/tickets']);
      })
      .catch((error: any) => {
        this.handleFirebaseError(error);
      })
      .finally(() => {
        this.loading = false; // Hide spinner
      });
  }

  private handleFirebaseError(error: any) {
    switch (error.code) {
      case 'auth/invalid-email':
        this.errorMessage = 'Invalid email format.';
        break;
      case 'auth/user-not-found':
        this.errorMessage = 'No user found with this email.';
        break;
      case 'auth/wrong-password':
        this.errorMessage = 'Incorrect password.';
        break;
      case 'auth/too-many-requests':
        this.errorMessage = 'Too many attempts. Please try again later.';
        break;
      case 'auth/popup-closed-by-user':
        this.errorMessage = 'Google login popup closed. Please try again.';
        break;
      default:
        this.errorMessage = 'An error occurred: ' + error.message;
    }
    console.error('Login error:', error);
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}