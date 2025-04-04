import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, Ticket, User } from '../../store/state/app.state';
import { selectUser } from '../../store/selectors/user.selector';
import { Observable } from 'rxjs';
import { TicketService } from '../../tickets/ticket.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-agent-dashboard',
  standalone:false,
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.css']
})
export class AgentDashboardComponent implements OnInit {
  user$: Observable<User | null>;
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

    // Fetch tickets where assignedTo matches the agent's uid
    const ticketsQuery = this.ticketService.getTicketsByAgent(agentId);
    ticketsQuery.subscribe({
      next: (tickets) => {
        // Sort tickets into respective arrays based on status
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
      // Reorder within the same column
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Move between columns
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update the ticket's status in Firestore
      const ticket = event.container.data[event.currentIndex];
      const newStatus = event.container.id as 'open' | 'in-progress' | 'resolved';
      this.updateTicketStatus(ticket, newStatus);
    }
  }

  updateTicketStatus(ticket: Ticket, newStatus: 'open' | 'in-progress' | 'resolved') {
    const ticketRef = doc(this.firestore, 'tickets', ticket.id);
    updateDoc(ticketRef, { status: newStatus })
      .then(() => {
        ticket.status = newStatus; // Update local ticket status
      })
      .catch(error => {
        this.errorMessage = 'Error updating ticket status: ' + error.message;
        // Revert the drag-and-drop if the update fails
        this.loadAssignedTickets(ticket.assignedTo!);
      });
  }
}