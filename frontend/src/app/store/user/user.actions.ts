import { createAction, props } from '@ngrx/store';
import { User } from '../../models/user.model';

export const loadMyProfile = createAction('[User] Load My Profile');
export const loadMyProfileSuccess = createAction('[User] Load My Profile Success', props<{ user: User }>());
export const loadMyProfileFailure = createAction('[User] Load My Profile Failure', props<{ error: any }>());

export const updateProfile = createAction('[User] Update Profile', props<{ user: User }>());
export const updateProfileSuccess = createAction('[User] Update Profile Success', props<{ user: User }>());
export const updateProfileFailure = createAction('[User] Update Profile Failure', props<{ error: any }>());