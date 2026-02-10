import {Component, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {Store} from '@ngrx/store';
import {Actions, ofType} from '@ngrx/effects';
import {Subscription} from 'rxjs';
import * as AuthActions from '../../store/authentification/authentification.actions';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnDestroy {
    user = {firstname: '', lastname: '', email: '', password: ''};
    successMessage = '';
    errorMessage = '';
    private subscription: Subscription = new Subscription();

    constructor(
        private store: Store,
        private actions$: Actions,
        private router: Router
    ) {
        this.subscription.add(
            this.actions$.pipe(ofType(AuthActions.registerSuccess)).subscribe(() => {
                this.successMessage = 'Inscription réussie ! Vous allez être redirigé vers la connexion...';
                setTimeout(() => {
                    this.router.navigate(['/login']);
                }, 2000);
            })
        );

        this.subscription.add(
            this.actions$.pipe(ofType(AuthActions.registerFailure)).subscribe((action) => {
                const err = action.error;
                console.error('Erreur inscription:', err);

                if (err && err.status === 409) {
                    this.errorMessage = 'Cet email est déjà utilisé.';
                } else {
                    this.errorMessage = "Une erreur est survenue lors de l'inscription.";
                }
            })
        );
    }

    onSubmit() {
        this.errorMessage = "";
        this.store.dispatch(AuthActions.register({registerRequest: this.user}));
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}