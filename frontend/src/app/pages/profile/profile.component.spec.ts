import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ProfileComponent} from './profile.component';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {Role} from '../../models/role.enum';
import {FormsModule} from '@angular/forms';
import {provideRouter} from '@angular/router';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Subject} from 'rxjs';
import * as UserActions from '../../store/user/user.actions';
import * as UserSelectors from '../../store/user/user.selectors';
import * as AuthActions from '../../store/authentification/authentification.actions';

describe('ProfileComponent', () => {
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
    let store: MockStore;
    let actions$: Subject<any>;

    const passagerUser = {
        id: 1,
        firstname: 'Jean',
        lastname: 'Test',
        email: 'jean@test.com',
        role: Role.PASSAGER,
        pointBalance: 100
    };

    beforeEach(async () => {
        actions$ = new Subject<any>();

        await TestBed.configureTestingModule({
            imports: [ProfileComponent, FormsModule],
            providers: [
                provideRouter([]),
                provideMockStore({
                    selectors: [
                        {selector: UserSelectors.selectCurrentUser, value: passagerUser}
                    ]
                }),
                provideMockActions(() => actions$)
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProfileComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(MockStore);

        vi.spyOn(store, 'dispatch');

        fixture.detectChanges();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('devrait charger le profil au démarrage', () => {
        expect(store.dispatch).toHaveBeenCalledWith(UserActions.loadMyProfile());
        expect(component.user).toEqual(passagerUser);
    });

    it('doit dispatcher updateProfile et afficher succès sur retour action', () => {
        vi.useFakeTimers();

        component.isEditing = true;
        if (component.user) component.user.firstname = 'Modifié';

        component.saveProfile();

        expect(store.dispatch).toHaveBeenCalledWith(UserActions.updateProfile({user: component.user!}));

        actions$.next(UserActions.updateProfileSuccess({user: {...passagerUser, firstname: 'Modifié'}}));

        expect(component.isEditing).toBe(false);
        expect(component.successMessage).toContain('succès');

        vi.advanceTimersByTime(3000);
        expect(component.successMessage).toBe('');
    });

    it('doit dispatcher AuthActions.logout() lors de la déconnexion', () => {
        component.logout();
        expect(store.dispatch).toHaveBeenCalledWith(AuthActions.logout());
    });
});
