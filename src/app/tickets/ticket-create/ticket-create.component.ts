import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, Ticket, User } from '../../store/state/app.state';
import * as TicketActions from '../../store/actions/ticket.action';
import { TicketService } from '../ticket.service';
import { selectUser } from '../../store/selectors/user.selector';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ticket-create',
  standalone: false,
  templateUrl: './ticket-create.component.html',
  styleUrls: ['./ticket-create.component.css']
})
export class TicketCreateComponent {
  ticket: Partial<Ticket> = {
    title: '',
    description: ''
  }; // Initialize without assignedTo
  files: File[] = [];
  user$: Observable<User | null>;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private store: Store<AppState>,
    private ticketService: TicketService,
    private router: Router
  ) {
    this.user$ = this.store.select(selectUser);
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.files = Array.from(input.files);
    }
  }

  onSubmit() {
    this.user$.subscribe(user => {
      if (user) {
        this.ticket.createdBy = user.uid;
        this.loading = true;
        this.errorMessage = null;

        this.ticketService.createTicket(this.ticket, this.files)
          .then(imageUrls => {
            const ticketToDispatch: Ticket = {
              id: '', // Will be set by Firestore
              title: this.ticket.title || '',
              description: this.ticket.description || '',
              status: 'open',
              imageUrls,
              createdBy: user.uid,
              createdAt: new Date()
              // Do not include assignedTo unless explicitly set
            };
            this.store.dispatch(TicketActions.createTicket({ ticket: ticketToDispatch }));
            this.ticket = { title: '', description: '' }; // Reset form
            this.files = []; // Reset files
            (document.querySelector('input[type="file"]') as HTMLInputElement).value = ''; // Reset file input
            this.router.navigate(['/tickets/my-tickets']); // Redirect to user's tickets
          })
          .catch(error => {
            this.errorMessage = 'Error creating ticket: ' + (error.message || 'An unexpected error occurred');
            console.error('Error creating ticket:', error);
          })
          .finally(() => {
            this.loading = false;
          });
      } else {
        this.errorMessage = 'You must be logged in to create a ticket.';
      }
    });
  }
}