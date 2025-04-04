import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { AppState, Ticket } from '../../store/state/app.state';
import * as TicketActions from '../../store/actions/ticket.action';
import { TicketService } from '../ticket.service';

@Component({
  selector: 'app-ticket-create',
  standalone: false,
  // imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <form (ngSubmit)="onSubmit()" class="p-4 max-w-md mx-auto">
      <mat-form-field class="w-full">
        <input matInput placeholder="Title" [(ngModel)]="ticket.title" name="title">
      </mat-form-field>
      <mat-form-field class="w-full">
        <textarea matInput placeholder="Description" [(ngModel)]="ticket.description" name="description"></textarea>
      </mat-form-field>
      <input type="file" multiple (change)="onFileChange($event)" class="mb-4">
      <button mat-raised-button color="primary" type="submit">Submit</button>
    </form>
  `,
  styles: []
})
export class TicketCreateComponent {
  ticket: Partial<Ticket> = {};
  files: File[] = [];

  constructor(
    private store: Store<AppState>,
    private ticketService: TicketService
  ) {}

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.files = Array.from(input.files);
    }
  }

  onSubmit() {
    this.ticketService.createTicket(this.ticket, this.files).then(() => {
      this.store.dispatch(TicketActions.createTicket({ ticket: { ...this.ticket, imageUrls: [] } as Ticket }));
    });
  }
}