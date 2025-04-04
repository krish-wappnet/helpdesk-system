import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, Ticket, User } from '../../store/state/app.state';
import { selectUser } from '../../store/selectors/user.selector';
import { TicketService } from '../ticket.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-tickets',
  standalone: false,
  templateUrl: './user-tickets.component.html',
  styleUrls: ['./user-tickets.component.css']
})
export class UserTicketsComponent implements OnInit {
  user$: Observable<User | null>;
  tickets: Ticket[] = [];
  loading = false;

  constructor(
    private store: Store<AppState>,
    private ticketService: TicketService
  ) {
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit() {
    this.user$.subscribe(user => {
      if (user) {
        this.loadUserTickets(user.uid);
      }
    });
  }

  loadUserTickets(userId: string) {
    this.loading = true;
    this.ticketService.getTicketsByUser(userId).subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tickets:', error);
        this.loading = false;
      }
    });
  }
}