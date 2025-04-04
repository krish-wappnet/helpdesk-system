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
  error?: string | null;
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
  responses?: TicketResponse[]; // Added responses field
}

export interface TicketResponse {
  text: string;
  respondedBy: string;
  timestamp: Date;
}

export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'agent' | 'user';
}