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
import * as PointSelectors from '../../store/point/point.selectors';
import * as PointActions from '../../store/point/point.actions';
import {PointBalance} from '../../models/point-balance.model';

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
        pointBalance: 100,
        totalPointsEarned: 250
    };

    const mockBalance: PointBalance = {
        currentBalance: 100,
        totalEarned: 250,
        level: 'EXPLORATEUR',
        levelLabel: 'Explorateur',
        levelRank: 2,
        nextLevel: 'VOYAGEUR',
        nextLevelLabel: 'Voyageur',
        pointsToNextLevel: 350,
        nextLevelThreshold: 600,
        currentLevelThreshold: 200,
        levelProgressPercent: 12.5
    };

    beforeEach(async () => {
        actions$ = new Subject<any>();

        await TestBed.configureTestingModule({
            imports: [ProfileComponent, FormsModule],
            providers: [
                provideRouter([]),
                provideMockStore({
                    selectors: [
                        {selector: UserSelectors.selectCurrentUser, value: passagerUser},
                        {selector: PointSelectors.selectBalance, value: mockBalance}
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

    it('devrait charger le profil et le solde au demarrage', () => {
        expect(store.dispatch).toHaveBeenCalledWith(UserActions.loadMyProfile());
        expect(store.dispatch).toHaveBeenCalledWith(PointActions.loadBalance());
        expect(component.user).toEqual(passagerUser);
    });

    it('doit avoir le balance charge', () => {
        expect(component.balance).toEqual(mockBalance);
        expect(component.balance?.level).toBe('EXPLORATEUR');
    });

    it('doit calculer la progression depuis le balance', () => {
        expect(component.progressPercent).toBe(12.5);
    });

    it('doit retourner le seuil du prochain niveau', () => {
        expect(component.nextLevelThreshold).toBe(600);
    });

    it('doit dispatcher updateProfile et afficher succes sur retour action', () => {
        vi.useFakeTimers();

        component.isEditing = true;
        if (component.user) component.user.firstname = 'Modifie';

        component.saveProfile();

        expect(store.dispatch).toHaveBeenCalledWith(UserActions.updateProfile({user: component.user!}));

        actions$.next(UserActions.updateProfileSuccess({user: {...passagerUser, firstname: 'Modifie'}}));

        expect(component.isEditing).toBe(false);
        expect(component.successMessage).toContain('succ');

        vi.advanceTimersByTime(3000);
        expect(component.successMessage).toBe('');
    });

    it('doit dispatcher AuthActions.logout() lors de la deconnexion', () => {
        component.logout();
        expect(store.dispatch).toHaveBeenCalledWith(AuthActions.logout());
    });

    it('doit supporter le tab historique', () => {
        component.activeTab = 'history';
        expect(component.activeTab).toBe('history');
    });
});
