import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, User } from '../../store/state/app.state';
import { selectUser } from '../../store/selectors/user.selector';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: false, // Changed to true since we're using imports
//   imports: [CommonModule, RouterModule], // Added RouterModule for routerLink
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  user$: Observable<User | null>;
  isMenuOpen = false;

  constructor(
    private store: Store<AppState>,
    private authService: AuthService,
    private router: Router
  ) {
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit() {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/auth/login']);
      this.isMenuOpen = false;
    }).catch(error => {
      console.error('Error logging out:', error);
    });
  }
}