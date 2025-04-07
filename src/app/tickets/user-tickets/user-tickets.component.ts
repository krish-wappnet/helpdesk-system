import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, Ticket, User } from '../../store/state/app.state';
import { selectUser } from '../../store/selectors/user.selector';
import { TicketService } from '../ticket.service';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-user-tickets',
  standalone:false,
  templateUrl: './user-tickets.component.html',
  styleUrls: ['./user-tickets.component.css'],
})
export class UserTicketsComponent implements OnInit {
  user$: Observable<User | null>;
  tickets: Ticket[] = [];
  loading = false;
  imageLoading: { [key: string]: boolean } = {};
  searchQuery = '';
  private searchTerms = new Subject<string>();

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
        this.setupSearch(user.uid);
      }
    });
  }

  loadUserTickets(userId: string) {
    this.loading = true;
    this.ticketService.getTicketsByUser(userId).subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.initImageLoading(tickets);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tickets:', error);
        this.loading = false;
      },
    });
  }

  setupSearch(userId: string) {
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query: string) => {
        this.loading = true;
        if (!query.trim()) {
          return this.ticketService.getTicketsByUser(userId);
        }
        return this.ticketService.searchTickets(query, userId);
      })
    ).subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.initImageLoading(tickets);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching tickets:', error);
        this.loading = false;
      },
    });
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerms.next(target.value);
  }

  initImageLoading(tickets: Ticket[]) {
    this.imageLoading = {};
    tickets.forEach(ticket => {
      if (ticket.imageUrls?.length) {
        ticket.imageUrls.forEach(url => {
          this.imageLoading[url] = true;
        });
      }
    });
  }

  onImageLoad(url: string) {
    this.imageLoading[url] = false;
  }

  onImageError(url: string) {
    this.imageLoading[url] = false;
    console.error(`Failed to load image: ${url}`);
  }
}