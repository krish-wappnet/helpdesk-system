import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  errorMessage: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.signupForm.reset();
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.errorMessage = null;
    this.loading = true;
    const { email, password } = this.signupForm.value;
    this.authService.signup(email, password)
      .then(() => {
        this.router.navigate(['/tickets']);
      })
      .catch((error: any) => {
        this.handleFirebaseError(error);
      })
      .finally(() => {
        this.loading = false;
      });
  }

  private handleFirebaseError(error: any) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        this.errorMessage = 'This email is already in use.';
        break;
      case 'auth/invalid-email':
        this.errorMessage = 'Invalid email format.';
        break;
      case 'auth/weak-password':
        this.errorMessage = 'Password is too weak. Must be at least 6 characters.';
        break;
      default:
        this.errorMessage = 'An error occurred: ' + error.message;
    }
    console.error('Signup error:', error);
  }

  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }
}