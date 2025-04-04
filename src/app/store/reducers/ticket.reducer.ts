import { createReducer, on } from '@ngrx/store';
import { TicketState } from '../state/app.state';
import * as TicketActions from '../actions/ticket.action';

export const initialState: TicketState = {
  tickets: [],
  loading: false,
  error: null
};

export const ticketReducer = createReducer(
  initialState,
  on(TicketActions.loadTickets, state => ({ ...state, loading: true })),
  on(TicketActions.loadTicketsSuccess, (state, { tickets }) => ({ ...state, tickets, loading: false })),
  on(TicketActions.loadTicketsFailure, (state, { error }) => ({ ...state, error, loading: false })),
  on(TicketActions.createTicketSuccess, (state, { ticket }) => ({
    ...state,
    tickets: [...state.tickets, ticket],
    loading: false
  }))
);