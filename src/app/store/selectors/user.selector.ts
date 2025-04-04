import { createSelector } from '@ngrx/store';
import { AppState } from '../state/app.state';

export const selectUserState = (state: AppState) => state.user;
export const selectUser = createSelector(
  selectUserState,
  (userState) => userState.currentUser // Changed from userState.user to userState.currentUser
);