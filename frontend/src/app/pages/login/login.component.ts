import {Component, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {Store} from '@ngrx/store';
import {Actions, ofType} from '@ngrx/effects';
import {Subscription} from 'rxjs';
import * as AuthActions from '../../store/authentification/authentification.actions';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy {
    credentials = {email: '', password: ''};
    successMessage = '';
    errorMessage = '';
    private subscription: Subscription = new Subscription();

    constructor(
        private store: Store,
        private actions$: Actions,
        private router: Router
    ) {
        this.subscription.add(
            this.actions$.pipe(ofType(AuthActions.loginSuccess)).subscribe(() => {
                this.successMessage = 'Connexion réussie ! Redirection en cours...';
                setTimeout(() => {
                    this.router.navigate(['/profile']);
                }, 1500);
            })
        );

        this.subscription.add(
            this.actions$.pipe(ofType(AuthActions.loginFailure)).subscribe(() => {
                this.errorMessage = 'Identifiants invalides ou erreur de connexion.';
            })
        );
    }

    onSubmit() {
        this.successMessage = '';
        this.errorMessage = '';
        this.store.dispatch(AuthActions.login({authRequest: this.credentials}));
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}