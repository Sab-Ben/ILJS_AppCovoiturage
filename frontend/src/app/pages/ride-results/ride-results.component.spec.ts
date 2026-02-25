import {ComponentFixture, TestBed} from '@angular/core/testing';
import {RideResultsComponent} from './ride-results.component';
import {RideService} from '../../services/ride.service';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {ActivatedRoute, provideRouter, Router} from '@angular/router';
import {of, Subject} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {By} from '@angular/platform-browser';
import * as ReservationActions from '../../store/reservation/reservation.actions';

describe('RideResultsComponent', () => {
    let component: RideResultsComponent;
    let fixture: ComponentFixture<RideResultsComponent>;
    let store: MockStore;
    let actions$ = new Subject<any>();
    let router: Router;

    // Mock du RideService
    const mockRideService = {
        searchRides: vi.fn()
    };

    const mockRides = [
        {id: 1, from: 'Paris', to: 'Lille', date: '2026-05-01', availableSeats: 3, driverName: 'Alice'},
        {id: 2, from: 'Paris', to: 'Lille', date: '2026-05-01', availableSeats: 0, driverName: 'Bob'}
    ];

    beforeEach(async () => {
        // Espionner window.alert pour éviter les blocages
        vi.spyOn(window, 'alert').mockImplementation(() => {
        });

        await TestBed.configureTestingModule({
            imports: [RideResultsComponent],
            providers: [
                {provide: RideService, useValue: mockRideService},
                provideMockStore(),
                provideMockActions(() => actions$),
                provideRouter([]),
                {
                    provide: ActivatedRoute,
                    useValue: {
                        queryParamMap: of(new Map([
                            ['from', 'Paris'],
                            ['to', 'Lille'],
                            ['date', '2026-05-01'],
                            ['seats', '2']
                        ]))
                    }
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(RideResultsComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(MockStore);
        router = TestBed.inject(Router);

        vi.spyOn(store, 'dispatch');
        vi.spyOn(router, 'navigate');
    });

    it('devrait récupérer les trajets basés sur les query params au démarrage', async () => {
        mockRideService.searchRides.mockReturnValue(of(mockRides));

        fixture.detectChanges(); // ngOnInit
        await fixture.whenStable();

        expect(component.from).toBe('Paris');
        expect(mockRideService.searchRides).toHaveBeenCalledWith('Paris', 'Lille', '2026-05-01');
        expect(component.rides.length).toBe(2);
    });

    it('devrait afficher un message si aucun trajet n\'est trouvé', async () => {
        mockRideService.searchRides.mockReturnValue(of([]));

        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.errorMsg).toBe('Aucun trajet trouvé.');
        const warning = fixture.debugElement.query(By.css('.warning'));
        expect(warning.nativeElement.textContent).toContain('Aucun trajet trouvé');
    });

    it('devrait dispatcher createReservation lors de l\'appel à book()', async () => {
        mockRideService.searchRides.mockReturnValue(of(mockRides));
        fixture.detectChanges();
        await fixture.whenStable();

        const rideToBook = mockRides[0];
        component.book(rideToBook);

        expect(store.dispatch).toHaveBeenCalledWith(
            ReservationActions.createReservation({
                payload: {
                    rideId: 1,
                    seats: 2, // Provient des queryParams (seats=2)
                    desiredRoute: 'Paris -> Lille'
                }
            })
        );
    });

    it('devrait bloquer la réservation si plus de places disponibles', () => {
        const fullRide = mockRides[1]; // Bob n'a plus de place (availableSeats: 0)
        component.book(fullRide);

        expect(window.alert).toHaveBeenCalledWith('Plus de place disponible pour ce trajet.');
        expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('devrait naviguer vers mes réservations après un succès', async () => {
        fixture.detectChanges();

        // On déclenche manuellement l'action de succès
        actions$.next(ReservationActions.createReservationSuccess({reservation: {id: 99} as any}));

        expect(window.alert).toHaveBeenCalledWith('Réservation effectuée ✅');
        expect(router.navigate).toHaveBeenCalledWith(['/my-reservations']);
    });

    it('devrait retourner à la recherche avec les critères actuels', () => {
        component.from = 'Paris';
        component.to = 'Lille';
        component.date = '2026-05-01';
        component.seats = 2;

        component.goBackToSearch();

        expect(router.navigate).toHaveBeenCalledWith(['/search-ride'], {
            queryParams: {from: 'Paris', to: 'Lille', date: '2026-05-01', seats: 2}
        });
    });
});