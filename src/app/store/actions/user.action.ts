import { createAction, props } from '@ngrx/store';
import { User } from '../state/app.state';

export const loadUser = createAction('[User] Load User');
export const loadUserSuccess = createAction('[User] Load User Success', props<{ user: User }>());
export const loadUserFailure = createAction('[User] Load User Failure', props<{ error: any }>());

// New action for clearing user on logout
export const clearUser = createAction('[User] Clear User');