import {ComponentFixture, TestBed} from '@angular/core/testing';
import {RideDetailComponent} from './ride-detail.component';
import {RideService} from '../../services/ride.service';
import {MapService} from '../../services/map.service';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {ActivatedRoute, provideRouter, Router} from '@angular/router';
import {of, Subject} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import * as ReservationActions from '../../store/reservation/reservation.actions';

describe('RideDetailComponent', () => {
    let component: RideDetailComponent;
    let fixture: ComponentFixture<RideDetailComponent>;
    let store: MockStore;
    let actions$ = new Subject<any>();
    let router: Router;

    const mockRideService = {getRideById: vi.fn()};
    const mockMapService = {
        initMap: vi.fn(),
        drawRoute: vi.fn(),
        clearRoute: vi.fn()
    };

    const mockRide = {
        id: 123,
        from: 'Paris', to: 'Lyon',
        fromLat: 48.8566, fromLng: 2.3522,
        toLat: 45.7640, toLng: 4.8357,
        availableSeats: 4
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RideDetailComponent],
            providers: [
                {provide: RideService, useValue: mockRideService},
                {provide: MapService, useValue: mockMapService},
                provideMockStore(),
                provideMockActions(() => actions$),
                provideRouter([]),
                {
                    provide: ActivatedRoute,
                    useValue: {
                        paramMap: of(new Map([['id', '123']])),
                        queryParamMap: of(new Map([['seats', '2']]))
                    }
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(RideDetailComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(MockStore);
        router = TestBed.inject(Router);

        vi.spyOn(store, 'dispatch');
        vi.spyOn(router, 'navigate');
    });

    // ✅ Utilisation de async/await à la place de fakeAsync
    it('devrait charger le trajet et initialiser la carte au démarrage', async () => {
        mockRideService.getRideById.mockReturnValue(of(mockRide));

        fixture.detectChanges(); // ngOnInit

        // Attend que les promesses Angular soient résolues
        await fixture.whenStable();

        // Petit hack pour le setTimeout(..., 0) de la carte
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(mockRideService.getRideById).toHaveBeenCalledWith('123');
        expect(component.ride).toEqual(mockRide);
        expect(mockMapService.initMap).toHaveBeenCalled();
        expect(mockMapService.drawRoute).toHaveBeenCalled();
    });

    it('devrait dispatcher l\'action createReservation si les données sont valides', async () => {
        mockRideService.getRideById.mockReturnValue(of(mockRide));
        fixture.detectChanges();
        await fixture.whenStable();

        component.desiredRoute = 'Trajet test';
        component.selectedSeats = 1;
        component.reserve();

        expect(store.dispatch).toHaveBeenCalledWith(
            ReservationActions.createReservation({
                payload: {rideId: 123, seats: 1, desiredRoute: 'Trajet test'}
            })
        );
    });
});