export interface AppState {
  tickets: TicketState;
  user: UserState;
}

export interface TicketState {
  tickets: Ticket[];
  loading: boolean;
  error: any;
}

export interface UserState {
  currentUser: User | null;
  error?: string | null; // Optional: for storing errors
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  imageUrls: string[];
  createdBy: string;
  createdAt: Date;
  assignedTo?: string;
}

export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'agent' | 'user';
}