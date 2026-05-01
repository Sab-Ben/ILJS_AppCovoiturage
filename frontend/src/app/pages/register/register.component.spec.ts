import {ComponentFixture, TestBed} from '@angular/core/testing';
import {RegisterComponent} from './register.component';
import {provideRouter, Router} from '@angular/router';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {FormsModule} from '@angular/forms';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Subject} from 'rxjs';
import * as AuthActions from '../../store/authentification/authentification.actions';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let store: MockStore;
    let actions$: Subject<any>;
    let router: Router;

    beforeEach(async () => {
        actions$ = new Subject<any>();

        await TestBed.configureTestingModule({
            imports: [RegisterComponent, FormsModule],
            providers: [
                provideRouter([]),
                provideMockStore(),
                provideMockActions(() => actions$)
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(RegisterComponent);
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

    it('doit dispatcher register, afficher le succès et rediriger après 2s', () => {
        vi.useFakeTimers();

        component.onSubmit();

        expect(store.dispatch).toHaveBeenCalledWith(AuthActions.register({registerRequest: component.user}));

        actions$.next(AuthActions.registerSuccess());

        expect(component.successMessage).toContain('Inscription réussie');
        expect(router.navigate).not.toHaveBeenCalled();

        vi.advanceTimersByTime(2000);

        expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('doit afficher une erreur spécifique si email déjà utilisé (409)', () => {
        component.onSubmit();

        const err = {status: 409};
        actions$.next(AuthActions.registerFailure({error: err}));

        expect(component.errorMessage).toBe('Cet email est déjà utilisé.');
        expect(component.successMessage).toBe('');
    });

    it('doit afficher une erreur générique pour les autres erreurs', () => {
        component.onSubmit();

        const err = {status: 500};
        actions$.next(AuthActions.registerFailure({error: err}));

        expect(component.errorMessage).toContain('Une erreur est survenue');
    });
});