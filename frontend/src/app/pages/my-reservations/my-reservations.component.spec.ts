import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyReservationsComponent } from './my-reservations.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as ReservationActions from '../../store/reservation/reservation.actions';
import * as ReservationSelectors from '../../store/reservation/reservation.selectors';
import { Reservation } from '../../models/reservation.model';

describe('MyReservationsComponent', () => {
    let component: MyReservationsComponent;
    let fixture: ComponentFixture<MyReservationsComponent>;
    let store: MockStore;
    let actions$ = new Subject<any>();

    const mockReserved: Reservation[] = [
        { id: 1, seats: 2, status: 'RESERVED', ride: { id: 10, from: 'Paris', to: 'Lille' } } as any
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

        // Configuration des sélecteurs par défaut
        store.overrideSelector(ReservationSelectors.selectReservedReservations, []);
        store.overrideSelector(ReservationSelectors.selectCompletedReservations, []);
        store.overrideSelector(ReservationSelectors.selectReservationLoading, false);
        store.overrideSelector(ReservationSelectors.selectReservationError, null);

        vi.spyOn(store, 'dispatch');
    });

    it('devrait être créé et charger les données au démarrage', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
        expect(store.dispatch).toHaveBeenCalledWith(ReservationActions.loadReservations({ status: 'RESERVED' }));
        expect(store.dispatch).toHaveBeenCalledWith(ReservationActions.loadReservations({ status: 'COMPLETED' }));
    });

    it('devrait afficher la liste des réservations quand elles sont présentes', () => {
        // 1. Injecter les données dans le store
        store.overrideSelector(ReservationSelectors.selectReservedReservations, mockReserved);
        store.refreshState();

        // 2. Mettre à jour la vue
        fixture.detectChanges();

        // 3. Correction du sélecteur : on cherche '.card' et non '.ride-card'
        const cards = fixture.debugElement.queryAll(By.css('.card'));
        expect(cards.length).toBe(1);
        expect(cards[0].nativeElement.textContent).toContain('Paris → Lille');
    });

    it('devrait changer de tab quand on clique sur les boutons', () => {
        fixture.detectChanges();

        // On simule le clic sur le bouton "Effectuées"
        const buttons = fixture.debugElement.queryAll(By.css('.btn'));
        const completedBtn = buttons.find(b => b.nativeElement.textContent.includes('Effectuées'));

        completedBtn?.triggerEventHandler('click', null);
        fixture.detectChanges();

        expect(component.tab).toBe('completed');
        expect(completedBtn?.nativeElement.classList).toContain('active');
    });

    it('devrait appeler l\'annulation avec confirmation', () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true);

        const reservation = mockReserved[0];
        component.cancel(reservation);

        expect(window.confirm).toHaveBeenCalledWith('Annuler cette réservation ?');
        expect(store.dispatch).toHaveBeenCalledWith(ReservationActions.cancelReservation({ id: reservation.id }));
    });

    it('devrait afficher une alerte en cas de succès d\'annulation', () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

        fixture.detectChanges(); // Active l'abonnement dans ngOnInit

        // Simuler l'effet (l'action de succès qui passe dans le flux actions$)
        actions$.next(ReservationActions.cancelReservationSuccess({ id: 1 }));

        expect(alertSpy).toHaveBeenCalledWith('Réservation annulée ✅');
    });

    it('devrait afficher le message d\'erreur si le sélecteur d\'erreur émet', () => {
        // Dans ton code, le message est stocké si error est truthy
        store.overrideSelector(ReservationSelectors.selectReservationError, { message: 'Failed' });
        store.refreshState();
        fixture.detectChanges();

        const container = fixture.nativeElement.textContent;
        expect(container).toContain('Erreur lors du chargement des réservations.');
    });
});