import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, Ticket, User } from '../../store/state/app.state';
import { selectUser } from '../../store/selectors/user.selector';
import { Observable } from 'rxjs';
import { TicketService } from '../../tickets/ticket.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Firestore, doc, updateDoc, arrayUnion } from '@angular/fire/firestore';

@Component({
  selector: 'app-agent-dashboard',
  standalone: false,
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.css']
})
export class AgentDashboardComponent implements OnInit {
  user$: Observable<User | null>;
  currentUser: User | null = null;
  openTickets: Ticket[] = [];
  inProgressTickets: Ticket[] = [];
  resolvedTickets: Ticket[] = [];
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private store: Store<AppState>,
    private ticketService: TicketService,
    private firestore: Firestore
  ) {
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit() {
    this.user$.subscribe(user => {
      this.currentUser = user;
      if (user && (user.role === 'agent' || user.role === 'admin')) {
        this.loadAssignedTickets(user.uid);
      } else {
        this.errorMessage = 'You do not have permission to view this dashboard.';
      }
    });
  }

  loadAssignedTickets(agentId: string) {
    this.loading = true;
    this.errorMessage = null;

    this.ticketService.getTicketsByAgent(agentId).subscribe({
      next: (tickets) => {
        console.log('Received tickets in loadAssignedTickets:', tickets);
        this.openTickets = tickets.filter(ticket => ticket.status === 'open');
        this.inProgressTickets = tickets.filter(ticket => ticket.status === 'in-progress');
        this.resolvedTickets = tickets.filter(ticket => ticket.status === 'resolved');
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading tickets: ' + error.message;
        this.loading = false;
      }
    });
  }

  drop(event: CdkDragDrop<Ticket[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const ticket = event.container.data[event.currentIndex];
      const newStatus = event.container.id as 'open' | 'in-progress' | 'resolved';
      console.log('Dropping ticket:', ticket, 'New status:', newStatus);
      this.updateTicketStatus(ticket, newStatus);
    }
  }

  updateTicketStatus(ticket: Ticket, newStatus: 'open' | 'in-progress' | 'resolved') {
    if (!ticket.id) {
      this.errorMessage = 'Cannot update ticket: Ticket ID is missing';
      console.error('Invalid ticket ID:', ticket);
      return;
    }

    const ticketRef = doc(this.firestore, 'tickets', ticket.id);
    updateDoc(ticketRef, { status: newStatus })
      .then(() => {
        ticket.status = newStatus;
        console.log('Ticket status updated:', ticket);
      })
      .catch(error => {
        this.errorMessage = 'Error updating ticket status: ' + error.message;
        console.error('Firestore error:', error);
        if (ticket.assignedTo) {
          this.loadAssignedTickets(ticket.assignedTo);
        }
      });
  }

  respondToTicket(ticket: Ticket, response: string) {
    if (!response.trim()) return;

    if (!ticket.id) {
      this.errorMessage = 'Cannot respond to ticket: Ticket ID is missing';
      console.error('Invalid ticket ID:', ticket);
      return;
    }

    const ticketRef = doc(this.firestore, 'tickets', ticket.id);
    const responseData = {
      text: response,
      respondedBy: this.currentUser?.uid || 'unknown',
      timestamp: new Date()
    };

    updateDoc(ticketRef, {
      responses: arrayUnion(responseData)
    })
      .then(() => {
        if (!ticket.responses) ticket.responses = [];
        ticket.responses.push(responseData);
        console.log('Response added:', responseData);
      })
      .catch(error => {
        this.errorMessage = 'Error adding response: ' + error.message;
        console.error('Firestore error:', error);
      });
  }
}

export interface TicketResponse {
  text: string;
  respondedBy: string;
  timestamp: Date;
}