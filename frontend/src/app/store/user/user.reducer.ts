import { createReducer, on } from '@ngrx/store';
import { User } from '../../models/user.model';
import * as UserActions from './user.actions';

export interface UserState {
    currentUser: User | null;
    loading: boolean;
    error: any;
}

export const initialState: UserState = {
    currentUser: null,
    loading: false,
    error: null
};

export const userReducer = createReducer(
    initialState,
    on(UserActions.loadMyProfile, UserActions.updateProfile, (state) => ({ ...state, loading: true })),
    on(UserActions.loadMyProfileSuccess, UserActions.updateProfileSuccess, (state, { user }) => ({
        ...state,
        loading: false,
        currentUser: user,
        error: null
    })),
    on(UserActions.loadMyProfileFailure, UserActions.updateProfileFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    }))
);