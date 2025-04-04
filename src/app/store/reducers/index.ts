import { ActionReducerMap } from '@ngrx/store';
import { AppState } from '../state/app.state';
import { ticketReducer } from './ticket.reducer';
import { userReducer } from './user.reducer';

export const reducers: ActionReducerMap<AppState> = {
  tickets: ticketReducer,
  user: userReducer
};