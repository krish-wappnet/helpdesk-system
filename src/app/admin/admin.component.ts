import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { AppState, Ticket } from '../store/state/app.state';
import * as TicketActions from '../store/actions/ticket.action';
import { select } from '@ngrx/store';

@Component({
  selector: 'app-admin',
  standalone: false,
  // imports: [CommonModule, MatTableModule],
  template: `
    <div class="p-4">
      <mat-table [dataSource]="tickets" class="mat-elevation-z8">
        <ng-container matColumnDef="title">
          <mat-header-cell *matHeaderCellDef>Title</mat-header-cell>
          <mat-cell *matCellDef="let ticket">{{ ticket.title }}</mat-cell>
        </ng-container>
        <ng-container matColumnDef="status">
          <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
          <mat-cell *matCellDef="let ticket">{{ ticket.status }}</mat-cell>
        </ng-container>
        <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
        <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
      </mat-table>
    </div>
  `,
  styles: []
})
export class AdminComponent implements OnInit {
  tickets: Ticket[] = [];
  displayedColumns: string[] = ['title', 'status'];

  constructor(private store: Store<AppState>) {
    this.store.pipe(select(state => state.tickets.tickets)).subscribe(tickets => {
      this.tickets = tickets;
    });
  }

  ngOnInit() {
    this.store.dispatch(TicketActions.loadTickets());
  }
}