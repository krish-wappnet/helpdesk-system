import { createAction, props } from '@ngrx/store';
import { Ticket } from '../state/app.state';

export const loadTickets = createAction('[Tickets] Load Tickets');
export const loadTicketsSuccess = createAction('[Tickets] Load Tickets Success', props<{ tickets: Ticket[] }>());
export const loadTicketsFailure = createAction('[Tickets] Load Tickets Failure', props<{ error: any }>());

export const createTicket = createAction('[Tickets] Create Ticket', props<{ ticket: Ticket }>());
export const createTicketSuccess = createAction('[Tickets] Create Ticket Success', props<{ ticket: Ticket }>());
export const createTicketFailure = createAction('[Tickets] Create Ticket Failure', props<{ error: any }>());