import { createReducer, on } from '@ngrx/store';
import * as AuthenticationActions from './authentification.actions';

export interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: any;
}

export const initialState: AuthState = {
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
};

export const authentificationReducer = createReducer(
    initialState,

    on(AuthenticationActions.login, AuthenticationActions.register, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(AuthenticationActions.loginSuccess, (state, { token }) => ({
        ...state,
        loading: false,
        isAuthenticated: true,
        token: token,
        error: null
    })),

    on(AuthenticationActions.registerSuccess, (state) => ({
        ...state,
        loading: false,
        error: null
    })),

    on(AuthenticationActions.loginFailure, AuthenticationActions.registerFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error: error
    })),

    on(AuthenticationActions.logout, (state) => ({
        ...initialState
    })),

    on(AuthenticationActions.initAuth, (state) => {
        return state;
    })
);