import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterLink} from "@angular/router";
import {User} from "../../models/user.model";
import {Role} from "../../models/role.enum";

import {Store} from '@ngrx/store';
import {Actions, ofType} from '@ngrx/effects';
import {Subscription} from 'rxjs';
import * as UserActions from '../../store/user/user.actions';
import * as UserSelectors from '../../store/user/user.selectors';
import * as AuthActions from '../../store/authentification/authentification.actions';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
    user: User | undefined;
    isEditing = false;
    successMessage = '';
    roles = Object.values(Role);

    private subscription: Subscription = new Subscription();

    constructor(
        private store: Store,
        private actions$: Actions
    ) {
    }

    ngOnInit() {
        this.loadProfile();

        // 1. Écouter le state pour mettre à jour l'utilisateur affiché
        this.subscription.add(
            this.store.select(UserSelectors.selectCurrentUser).subscribe(data => {
                if (data) {
                    this.user = {...data};
                }
            })
        );

        this.subscription.add(
            this.actions$.pipe(ofType(UserActions.updateProfileSuccess)).subscribe(() => {
                this.isEditing = false;
                this.successMessage = 'Profil mis à jour avec succès !';
                setTimeout(() => this.successMessage = '', 3000);
            })
        );

        this.subscription.add(
            this.actions$.pipe(ofType(UserActions.loadMyProfileFailure)).subscribe((action) => {
                console.error('Erreur chargement profil', action.error);
            })
        );

        this.subscription.add(
            this.actions$.pipe(ofType(UserActions.updateProfileFailure)).subscribe((action) => {
                console.error(action.error);
            })
        );
    }

    loadProfile() {
        this.store.dispatch(UserActions.loadMyProfile());
    }

    saveProfile() {
        if (this.user) {
            this.store.dispatch(UserActions.updateProfile({user: this.user}));
        }
    }

    logout() {
        this.store.dispatch(AuthActions.logout());
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}