import { createReducer, on } from '@ngrx/store';
import { UserState } from '../state/app.state';
import * as UserActions from '../actions/user.action';

export const initialState: UserState = {
  currentUser: null,
  role: 'user'
};

export const userReducer = createReducer(
  initialState,
  on(UserActions.loadUserSuccess, (state, { user }) => ({ ...state, currentUser: user, role: user.role })),
  on(UserActions.loadUserFailure, (state, { error }) => ({ ...state, error }))
);