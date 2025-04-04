import { createReducer, on } from '@ngrx/store';
import { UserState } from '../state/app.state';
import * as UserActions from '../actions/user.action';

// Initial state
const initialState: UserState = {
  currentUser: null,
  error: null
};

// Reducer
export const userReducer = createReducer(
  initialState,
  on(UserActions.loadUserSuccess, (state, { user }) => ({
    ...state,
    currentUser: user,
    error: null
  })),
  on(UserActions.loadUserFailure, (state, { error }) => ({
    ...state,
    currentUser: null,
    error: error.message
  })),
  // Handle clearUser action
  on(UserActions.clearUser, (state) => ({
    ...state,
    currentUser: null,
    error: null
  }))
);