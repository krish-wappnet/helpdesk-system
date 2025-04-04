import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../store/state/app.state';
import * as TicketActions from '../store/actions/ticket.action';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  template: `
    <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <mat-card>
        <mat-card-title>Total Tickets</mat-card-title>
        <mat-card-content>{{ totalTickets }}</mat-card-content>
      </mat-card>
      <mat-card>
        <mat-card-title>Open Tickets</mat-card-title>
        <mat-card-content>{{ openTickets }}</mat-card-content>
      </mat-card>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  totalTickets = 0;
  openTickets = 0;

  constructor(private store: Store<AppState>) {}

  ngOnInit() {
    console.log('Dispatching loadTickets');
    this.store.dispatch(TicketActions.loadTickets());
  }
}