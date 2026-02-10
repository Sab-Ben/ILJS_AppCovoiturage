import {ComponentFixture, TestBed} from '@angular/core/testing';
import {LoginComponent} from './login.component';
import {provideRouter, Router} from '@angular/router';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {FormsModule} from '@angular/forms';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Subject} from 'rxjs';
import * as AuthActions from '../../store/authentification/authentification.actions';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let store: MockStore;
    let actions$: Subject<any>;
    let router: Router;

    beforeEach(async () => {
        actions$ = new Subject<any>();

        await TestBed.configureTestingModule({
            imports: [LoginComponent, FormsModule],
            providers: [
                provideRouter([]),
                provideMockStore(),
                provideMockActions(() => actions$)
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(MockStore);
        router = TestBed.inject(Router);

        vi.spyOn(store, 'dispatch');
        vi.spyOn(router, 'navigate');

        fixture.detectChanges();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('doit dispatcher login et rediriger vers /profile lors du succès', () => {
        vi.useFakeTimers();

        component.credentials.email = 'test@test.com';
        component.credentials.password = 'Test1234!';

        component.onSubmit();

        expect(store.dispatch).toHaveBeenCalledWith(
            AuthActions.login({authRequest: {email: 'test@test.com', password: 'Test1234!'}})
        );

        actions$.next(AuthActions.loginSuccess({token: 'fake-token'}));

        expect(component.successMessage).toContain('Connexion réussie');

        vi.advanceTimersByTime(1500);
        expect(router.navigate).toHaveBeenCalledWith(['/profile']);
    });

    it('doit afficher un message d\'erreur si le login échoue', () => {
        component.onSubmit();

        actions$.next(AuthActions.loginFailure({error: 'Unauthorized'}));

        expect(router.navigate).not.toHaveBeenCalled();
        expect(component.errorMessage).toBe('Identifiants invalides ou erreur de connexion.');
    });
});