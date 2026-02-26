import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { User } from '../../models/user.model';
import { Role } from '../../models/role.enum';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Observable, Subscription } from 'rxjs';
import * as UserActions from '../../store/user/user.actions';
import * as UserSelectors from '../../store/user/user.selectors';
import * as AuthActions from '../../store/authentification/authentification.actions';
import * as TrajetActions from '../../store/trajet/trajet.actions';
import * as TrajetSelectors from '../../store/trajet/trajet.selectors';
import { Trajet } from '../../models/trajet.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User | undefined;
  isEditing = false;
  successMessage = '';
  roles = Object.values(Role);
  trajets$: Observable<Trajet[]>;
  trajetsLoading$: Observable<boolean>;
  activeTab: 'rides' | 'bookings' = 'rides';

  private subscription: Subscription = new Subscription();

  constructor(
    private store: Store,
    private actions$: Actions
  ) {
    this.trajets$ = this.store.select(TrajetSelectors.selectAllTrajets);
    this.trajetsLoading$ = this.store.select(TrajetSelectors.selectTrajetsLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(UserActions.loadMyProfile());
    this.store.dispatch(TrajetActions.loadTrajets());

    this.subscription.add(
      this.store.select(UserSelectors.selectCurrentUser).subscribe(data => {
        if (data) this.user = { ...data };
      })
    );

    this.subscription.add(
      this.actions$.pipe(ofType(UserActions.updateProfileSuccess)).subscribe(() => {
        this.isEditing = false;
        this.successMessage = 'Profil mis à jour avec succès !';
        setTimeout(() => this.successMessage = '', 3000);
      })
    );
  }

  get initials(): string {
    if (!this.user) return '';
    const first = this.user.firstname?.charAt(0) || '';
    const last = this.user.lastname?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  saveProfile(): void {
    if (this.user) {
      this.store.dispatch(UserActions.updateProfile({ user: this.user }));
    }
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
