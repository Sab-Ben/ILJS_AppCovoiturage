import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subscription } from 'rxjs';
import * as AuthActions from '../../store/authentification/authentification.actions';

interface Credentials {
  email: string;
  password: string;
}

interface RegisterUser {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

type AuthTab = 'login' | 'register';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent implements OnInit, OnDestroy {
  activeTab: AuthTab = 'login';
  credentials: Credentials = { email: '', password: '' };
  user: RegisterUser = { firstname: '', lastname: '', email: '', password: '' };
  loginError = '';
  loginSuccess = '';
  registerError = '';
  registerSuccess = '';
  isLoading = false;
  emailFocused = false;
  passFocused = false;

  private subscription: Subscription = new Subscription();

  constructor(
    private store: Store,
    private actions$: Actions,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.setupAuthListeners();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'register') {
        this.activeTab = 'register';
      }
    });
  }

  private setupAuthListeners(): void {
    this.subscription.add(
      this.actions$.pipe(ofType(AuthActions.loginSuccess)).subscribe(() => {
        this.loginSuccess = 'Connexion réussie !';
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      })
    );

    this.subscription.add(
      this.actions$.pipe(ofType(AuthActions.loginFailure)).subscribe(() => {
        this.loginError = 'Identifiants invalides ou erreur de connexion.';
        this.isLoading = false;
      })
    );

    this.subscription.add(
      this.actions$.pipe(ofType(AuthActions.registerSuccess)).subscribe(() => {
        this.registerSuccess = 'Inscription réussie ! Vous allez être redirigé vers la connexion...';
        this.isLoading = false;
        setTimeout(() => {
          this.credentials = { email: this.user.email, password: this.user.password };
          this.user = { firstname: '', lastname: '', email: '', password: '' };
          this.activeTab = 'login';
          this.registerSuccess = '';
        }, 2000);
      })
    );

    this.subscription.add(
      this.actions$.pipe(ofType(AuthActions.registerFailure)).subscribe((action: any) => {
        const err = action.error;
        if (err && err.status === 409) {
          this.registerError = 'Cet email est déjà utilisé.';
        } else {
          this.registerError = "Une erreur est survenue lors de l'inscription.";
        }
        this.isLoading = false;
      })
    );
  }

  selectTab(tab: AuthTab): void {
    this.activeTab = tab;
    this.loginError = '';
    this.loginSuccess = '';
    this.registerError = '';
    this.registerSuccess = '';
  }

  onLoginSubmit(): void {
    this.loginError = '';
    this.loginSuccess = '';
    this.isLoading = true;
    this.store.dispatch(AuthActions.login({ authRequest: this.credentials }));
  }

  onRegisterSubmit(): void {
    this.registerError = '';
    this.registerSuccess = '';
    this.isLoading = true;
    this.store.dispatch(AuthActions.register({ registerRequest: this.user }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
