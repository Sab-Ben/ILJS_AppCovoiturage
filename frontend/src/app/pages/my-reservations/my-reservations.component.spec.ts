import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MyReservationsComponent} from './my-reservations.component';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {provideRouter} from '@angular/router';
import {By} from '@angular/platform-browser';
import {Subject} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import * as ReservationActions from '../../store/reservation/reservation.actions';
import * as ReservationSelectors from '../../store/reservation/reservation.selectors';
import {Reservation} from '../../models/reservation.model';

describe('MyReservationsComponent', () => {
    let component: MyReservationsComponent;
    let fixture: ComponentFixture<MyReservationsComponent>;
    let store: MockStore;
    let actions$ = new Subject<any>();

    // Mock de données pour les tests
    const mockReserved: Reservation[] = [
        {id: 1, seats: 2, status: 'RESERVED', ride: {id: 10, from: 'Paris', to: 'Lille', date: '2026-05-01'}} as any
    ];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MyReservationsComponent],
            providers: [
                provideMockStore(),
                provideMockActions(() => actions$),
                provideRouter([])
            ]
        }).compileComponents();

        store = TestBed.inject(MockStore);
        fixture = TestBed.createComponent(MyReservationsComponent);
        component = fixture.componentInstance;

        // Configuration par défaut des sélecteurs
        store.overrideSelector(ReservationSelectors.selectReservedReservations, []);
        store.overrideSelector(ReservationSelectors.selectCompletedReservations, []);
        store.overrideSelector(ReservationSelectors.selectReservationLoading, false);
        store.overrideSelector(ReservationSelectors.selectReservationError, null);

        // On espionne le dispatch
        vi.spyOn(store, 'dispatch');
    });

    it('devrait être créé et charger les données au démarrage', () => {
        fixture.detectChanges(); // Déclenche ngOnInit
        expect(component).toBeTruthy();

        // Vérifie que les actions de chargement ont été dispatchées
        expect(store.dispatch).toHaveBeenCalledWith(ReservationActions.loadReservations({status: 'RESERVED'}));
        expect(store.dispatch).toHaveBeenCalledWith(ReservationActions.loadReservations({status: 'COMPLETED'}));
    });

    it('devrait afficher la liste des réservations quand elles sont présentes', () => {
        // On met à jour le sélecteur avec nos mock data
        store.overrideSelector(ReservationSelectors.selectReservedReservations, mockReserved);
        store.refreshState();
        fixture.detectChanges();

        const cards = fixture.debugElement.queryAll(By.css('.ride-card'));
        expect(cards.length).toBe(1);
        expect(cards[0].nativeElement.textContent).toContain('Paris → Lille');
    });

    it('devrait changer de tab quand on clique sur les boutons', () => {
        fixture.detectChanges();
        component.switchTab('completed');
        expect(component.tab).toBe('completed');

        fixture.detectChanges();
        const activeBtn = fixture.debugElement.query(By.css('.btn.active'));
        expect(activeBtn.nativeElement.textContent).toContain('Courses effectuées');
    });

    it('devrait appeler la déconnexion avec confirmation', () => {
        // Mock de window.confirm
        vi.spyOn(window, 'confirm').mockReturnValue(true);

        const reservation = mockReserved[0];
        component.cancel(reservation);

        expect(window.confirm).toHaveBeenCalledWith('Annuler cette réservation ?');
        expect(store.dispatch).toHaveBeenCalledWith(ReservationActions.cancelReservation({id: reservation.id}));
    });

    it('devrait afficher une alerte en cas de succès d\'annulation', () => {
        // Mock de window.alert
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {
        });

        fixture.detectChanges(); // Souscrit aux actions

        // Simuler l'émission de l'action success
        actions$.next(ReservationActions.cancelReservationSuccess({id: 1}));

        expect(alertSpy).toHaveBeenCalledWith('Réservation annulée ✅');
    });

    it('devrait afficher l\'erreur si le sélecteur d\'erreur émet', () => {
        store.overrideSelector(ReservationSelectors.selectReservationError, 'Erreur fatale');
        store.refreshState();
        fixture.detectChanges();

        const errorDiv = fixture.debugElement.query(By.css('.warning'));
        expect(errorDiv.nativeElement.textContent).toContain('Erreur lors du chargement');
    });
});