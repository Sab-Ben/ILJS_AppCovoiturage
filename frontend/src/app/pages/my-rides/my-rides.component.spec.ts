import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyRidesComponent } from './my-rides.component';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { By } from '@angular/platform-browser';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { of, Subject, throwError } from 'rxjs';
import * as TrajetActions from '../../store/trajet/trajet.actions';
import * as TrajetSelectors from '../../store/trajet/trajet.selectors';

import { GeocodingService } from '../../services/geocoding.service';
import { RoutingService } from '../../services/routing.service';
import { ReservationService } from '../../services/reservation.service'; // Ajouté

vi.mock('leaflet', () => {
    const mapMock = {
        setView: vi.fn().mockReturnThis(),
        removeLayer: vi.fn(),
        addLayer: vi.fn(),
        fitBounds: vi.fn()
    };
    const L = {
        map: vi.fn().mockReturnValue(mapMock),
        tileLayer: vi.fn().mockReturnValue({ addTo: vi.fn() }),
        Icon: vi.fn(),
        icon: vi.fn(),
        marker: vi.fn().mockReturnValue({
            addTo: vi.fn().mockReturnThis(),
            bindPopup: vi.fn().mockReturnThis(),
            openPopup: vi.fn().mockReturnThis(),
            setZIndexOffset: vi.fn().mockReturnThis()
        }),
        polyline: vi.fn().mockReturnValue({ addTo: vi.fn() }),
        geoJSON: vi.fn().mockReturnValue({ addTo: vi.fn(), getBounds: vi.fn() }),
        latLngBounds: vi.fn().mockReturnValue({ extend: vi.fn() }),
        Marker: { prototype: { options: {} } }
    };
    return { ...L, default: L };
});

describe('MyRidesComponent', () => {
    let component: MyRidesComponent;
    let fixture: ComponentFixture<MyRidesComponent>;
    let store: MockStore;
    let actions$: Subject<any>;
    let router: Router;
    let geocodingServiceMock: any;
    let routingServiceMock: any;
    let reservationServiceMock: any; // Ajouté

    const mockTrajets = [
        {
            id: 1,
            villeDepart: 'Paris',
            villeArrivee: 'Lyon',
            dateHeureDepart: '2025-05-01T10:00:00',
            placesDisponibles: 2,
            etapes: [],
            distanceKm: 450,
            dureeEstimee: '4h30'
        },
        {
            id: 2,
            villeDepart: 'Bordeaux',
            villeArrivee: 'Nantes',
            dateHeureDepart: '2025-06-15T08:30:00',
            placesDisponibles: 3,
            etapes: [],
            distanceKm: 350,
            dureeEstimee: '3h30'
        }
    ];

    // Mock des passagers pour le trajet ID 1
    const mockPassagers = [
        { passengerName: 'Bob Marley', seats: 1 },
        { passengerName: 'Alice Cooper', seats: 1 }
    ];

    beforeEach(async () => {
        actions$ = new Subject<any>();

        geocodingServiceMock = {
            getCoordinates: vi.fn().mockReturnValue(of(null)),
            searchAddresses: vi.fn().mockReturnValue(of([]))
        };

        routingServiceMock = {
            getRouteData: vi.fn().mockReturnValue(of(null))
        };

        // Configuration du mock ReservationService
        reservationServiceMock = {
            getReservationsForRide: vi.fn().mockImplementation((id) => {
                if (id === 1) return of(mockPassagers);
                return of([]); // Vide pour les autres
            })
        };

        await TestBed.configureTestingModule({
            imports: [MyRidesComponent],
            providers: [
                provideRouter([]),
                provideMockStore({
                    selectors: [
                        { selector: TrajetSelectors.selectAllTrajets, value: mockTrajets },
                        { selector: TrajetSelectors.selectTrajetsLoading, value: false }
                    ]
                }),
                provideMockActions(() => actions$),
                { provide: GeocodingService, useValue: geocodingServiceMock },
                { provide: RoutingService, useValue: routingServiceMock },
                { provide: ReservationService, useValue: reservationServiceMock } // Injecté
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(MyRidesComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(MockStore);
        router = TestBed.inject(Router);

        vi.spyOn(store, 'dispatch');
        vi.spyOn(window, 'confirm');

        // Déclenche ngOnInit
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load trajets and fetch passengers for each ride on init', () => {
        expect(store.dispatch).toHaveBeenCalledWith(TrajetActions.loadTrajets());

        // Vérifie que l'API de réservation a été appelée pour chaque trajet (id 1 et 2)
        expect(reservationServiceMock.getReservationsForRide).toHaveBeenCalledWith(1);
        expect(reservationServiceMock.getReservationsForRide).toHaveBeenCalledWith(2);

        // Vérifie que les données sont bien dans la map
        expect(component.passagersMap[1]).toEqual(mockPassagers);
        expect(component.passagersMap[2]).toEqual([]);
    });

    it('should display passenger badges in the template', () => {
        // Force la détection de changements pour afficher les badges
        fixture.detectChanges();

        const passengerBadges = fixture.debugElement.queryAll(By.css('.badge.bg-info'));

        // Il y a 2 passagers dans mockPassagers pour le trajet 1
        expect(passengerBadges.length).toBe(2);
        expect(passengerBadges[0].nativeElement.textContent).toContain('Bob Marley');
        expect(passengerBadges[1].nativeElement.textContent).toContain('Alice Cooper');
    });

    it('should display "Aucun passager" when the list is empty', () => {
        // Le trajet 2 n'a pas de passagers dans notre mock
        const rideCards = fixture.debugElement.queryAll(By.css('.card'));
        const secondCard = rideCards[1];

        const noPassengerText = secondCard.query(By.css('.italic')).nativeElement;
        expect(noPassengerText.textContent).toContain('Aucun passager pour le moment');
    });

    it('should handle errors when fetching passengers', () => {
        // On simule une erreur pour un nouveau trajet (id 99)
        reservationServiceMock.getReservationsForRide.mockReturnValue(throwError(() => new Error('Erreur API')));

        // @ts-ignore - accès à une méthode privée pour le test
        component.fetchPassagers(99);

        expect(component.passagersMap[99]).toEqual([]);
    });

    // --- Tests existants conservés et vérifiés ---

    it('should display the correct number of ride cards', () => {
        const cards = fixture.debugElement.queryAll(By.css('.rides-list .card'));
        expect(cards.length).toBe(2);
    });

    it('should dispatch deleteTrajet when user confirms', () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true);

        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 5);
        component.trajets[0] = { ...component.trajets[0], dateHeureDepart: futureDate.toISOString() };
        fixture.detectChanges();

        component.deleteTrajet(1);

        expect(window.confirm).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(TrajetActions.deleteTrajet({ id: 1 }));
    });

    it('should show alert on delete failure', () => {
        vi.spyOn(window, 'alert').mockImplementation(() => { });
        actions$.next(TrajetActions.deleteTrajetFailure({ error: 'Erreur' }));
        expect(window.alert).toHaveBeenCalledWith("Impossible de supprimer ce trajet.");
    });
});