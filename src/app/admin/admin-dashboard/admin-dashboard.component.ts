import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, Ticket, User } from '../../store/state/app.state';
import { selectUser } from '../../store/selectors/user.selector';
import { Observable } from 'rxjs';
import { Firestore, collection, query, getDocs, doc, updateDoc } from '@angular/fire/firestore';
import { TicketService } from '../../tickets/ticket.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone:false,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  user$: Observable<User | null>;
  totalUsers = 0;
  totalAgents = 0;
  tickets: Ticket[] = [];
  users: User[] = [];
  agents: User[] = [];
  loading = false;
  errorMessage: string | null = null;
  report: { totalTickets: number, open: number, inProgress: number, resolved: number, byAgent: { [key: string]: number } } | null = null;

  constructor(
    private store: Store<AppState>,
    private firestore: Firestore,
    private ticketService: TicketService
  ) {
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit() {
    this.user$.subscribe(user => {
      if (user && user.role === 'admin') {
        this.loadDashboardData();
      } else {
        this.errorMessage = 'You do not have permission to view this dashboard.';
      }
    });
  }

  loadDashboardData() {
    this.loading = true;
    this.errorMessage = null;

    this.loadUsers().then(() => {
      this.loadTickets().then(() => {
        this.loading = false;
      }).catch(error => {
        this.errorMessage = 'Error loading tickets: ' + error.message;
        this.loading = false;
      });
    }).catch(error => {
      this.errorMessage = 'Error loading users: ' + error.message;
      this.loading = false;
    });
  }

  async loadUsers() {
    const usersQuery = query(collection(this.firestore, 'users'));
    const snapshot = await getDocs(usersQuery);
    this.users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as User));

    this.totalUsers = this.users.length;
    this.totalAgents = this.users.filter(user => user.role === 'agent').length;
    this.agents = this.users.filter(user => user.role === 'agent');
  }

  async loadTickets() {
    const ticketsQuery = query(collection(this.firestore, 'tickets'));
    const snapshot = await getDocs(ticketsQuery);
    this.tickets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Ticket));
    console.log('Loaded tickets:', this.tickets);
  }

  assignTicketToAgent(ticket: Ticket, agentId: string | undefined) {
    // Find the original ticket from this.tickets to ensure we have the correct ID
    const originalTicket = this.tickets.find(t => t === ticket || t.id === ticket.id);
    if (!originalTicket || !originalTicket.id) {
      this.errorMessage = 'Cannot assign ticket: Ticket ID is missing or invalid';
      console.error('Invalid ticket:', ticket, 'Original ticket:', originalTicket);
      return;
    }
  
    const ticketRef = doc(this.firestore, 'tickets', originalTicket.id);
    const updateData = agentId ? { assignedTo: agentId } : { assignedTo: null };
    updateDoc(ticketRef, updateData)
      .then(() => {
        originalTicket.assignedTo = agentId || undefined;
        this.errorMessage = null;
        console.log('Ticket assigned successfully:', originalTicket);
      })
      .catch(error => {
        this.errorMessage = 'Error assigning ticket: ' + error.message;
        console.error('Firestore error:', error);
      });
  }

  changeTicketStatus(ticket: Ticket, status: 'open' | 'in-progress' | 'resolved') {
    const ticketRef = doc(this.firestore, 'tickets', ticket.id);
    updateDoc(ticketRef, { status })
      .then(() => {
        ticket.status = status;
      })
      .catch(error => {
        this.errorMessage = 'Error updating ticket status: ' + error.message;
      });
  }

  changeUserRole(user: User, role: 'user' | 'agent' | 'admin') {
    console.log(user)
    const userRef = doc(this.firestore, 'users', user.uid);
    
    updateDoc(userRef, { role })
      .then(() => {
        user.role = role;
        this.totalAgents = this.users.filter(u => u.role === 'agent').length;
        this.agents = this.users.filter(u => u.role === 'agent');
      })
      .catch(error => {
        this.errorMessage = 'Error updating user role: ' + error.message;
      });
  }

  generateReport() {
    const totalTickets = this.tickets.length;
    const open = this.tickets.filter(t => t.status === 'open').length;
    const inProgress = this.tickets.filter(t => t.status === 'in-progress').length;
    const resolved = this.tickets.filter(t => t.status === 'resolved').length;

    const byAgent: { [key: string]: number } = {};
    this.tickets.forEach(ticket => {
      if (ticket.assignedTo) {
        byAgent[ticket.assignedTo] = (byAgent[ticket.assignedTo] || 0) + 1;
      }
    });

    this.report = { totalTickets, open, inProgress, resolved, byAgent };
  }

  downloadReport() {
    if (!this.report) return;

    const csvRows = [];
    csvRows.push('Total Tickets,Open,In Progress,Resolved');
    csvRows.push(`${this.report.totalTickets},${this.report.open},${this.report.inProgress},${this.report.resolved}`);

    csvRows.push('\nTickets by Agent');
    csvRows.push('Agent Email,Number of Tickets');
    for (const [agentId, count] of Object.entries(this.report.byAgent)) {
      const agent = this.getAgentEmail(agentId);
      csvRows.push(`${agent},${count}`);
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ticket-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  getAgentEmail(agentId: string): string {
    const agent = this.users.find(u => u.uid === agentId);
    return agent ? agent.email : agentId;
  }
}