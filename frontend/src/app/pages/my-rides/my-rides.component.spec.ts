import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MyRidesComponent} from './my-rides.component';
import {provideRouter, Router} from '@angular/router';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {By} from '@angular/platform-browser';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {of, Subject} from 'rxjs';
import * as TrajetActions from '../../store/trajet/trajet.actions';
import * as TrajetSelectors from '../../store/trajet/trajet.selectors';

import {GeocodingService} from '../../services/geocoding.service';
import {RoutingService} from '../../services/routing.service';

vi.mock('leaflet', () => {
    const mapMock = {
        setView: vi.fn().mockReturnThis(),
        removeLayer: vi.fn(),
        addLayer: vi.fn(),
        fitBounds: vi.fn()
    };
    const L = {
        map: vi.fn().mockReturnValue(mapMock),
        tileLayer: vi.fn().mockReturnValue({addTo: vi.fn()}),
        Icon: vi.fn(),
        icon: vi.fn(),
        marker: vi.fn().mockReturnValue({
            addTo: vi.fn().mockReturnThis(),
            bindPopup: vi.fn().mockReturnThis(),
            openPopup: vi.fn().mockReturnThis(),
            setZIndexOffset: vi.fn().mockReturnThis()
        }),
        polyline: vi.fn().mockReturnValue({addTo: vi.fn()}),
        geoJSON: vi.fn().mockReturnValue({addTo: vi.fn(), getBounds: vi.fn()}),
        latLngBounds: vi.fn().mockReturnValue({extend: vi.fn()}),
        Marker: {prototype: {options: {}}}
    };
    return {...L, default: L};
});

describe('MyRidesComponent', () => {
    let component: MyRidesComponent;
    let fixture: ComponentFixture<MyRidesComponent>;
    let store: MockStore;
    let actions$: Subject<any>;
    let router: Router;
    let geocodingServiceMock: any;
    let routingServiceMock: any;

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

    beforeEach(async () => {
        actions$ = new Subject<any>();

        geocodingServiceMock = {
            getCoordinates: vi.fn().mockReturnValue(of(null)),
            searchAddresses: vi.fn().mockReturnValue(of([]))
        };

        routingServiceMock = {
            getRouteData: vi.fn().mockReturnValue(of(null))
        };

        await TestBed.configureTestingModule({
            imports: [MyRidesComponent],
            providers: [
                provideRouter([]),
                provideMockStore({
                    selectors: [
                        {selector: TrajetSelectors.selectAllTrajets, value: mockTrajets},
                        {selector: TrajetSelectors.selectTrajetsLoading, value: false}
                    ]
                }),
                provideMockActions(() => actions$),
                {provide: GeocodingService, useValue: geocodingServiceMock},
                {provide: RoutingService, useValue: routingServiceMock}
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(MyRidesComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(MockStore);
        router = TestBed.inject(Router);

        vi.spyOn(store, 'dispatch');
        vi.spyOn(window, 'confirm');

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load trajets on init (dispatch action)', () => {
        expect(store.dispatch).toHaveBeenCalledWith(TrajetActions.loadTrajets());
        expect(component.trajets.length).toBe(2);
        expect(component.isLoading).toBe(false);
    });

    it('should display the correct number of ride cards', () => {
        const cards = fixture.debugElement.queryAll(By.css('.rides-list .card'));
        expect(cards.length).toBe(2);
    });

    it('should display correct information in the card', () => {
        const firstCardTitle = fixture.debugElement.query(By.css('.card-title')).nativeElement;
        expect(firstCardTitle.textContent).toContain('Paris');
        expect(firstCardTitle.textContent).toContain('Lyon');
    });

    it('should dispatch deleteTrajet when user confirms', () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true);

        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 5);
        // On met à jour l'objet local pour passer la validation de date
        component.trajets[0] = {...component.trajets[0], dateHeureDepart: futureDate.toISOString()};
        fixture.detectChanges();

        component.deleteTrajet(1);

        expect(window.confirm).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(TrajetActions.deleteTrajet({id: 1}));
    });

    it('should NOT dispatch delete when user cancels', () => {
        vi.spyOn(window, 'confirm').mockReturnValue(false);

        component.deleteTrajet(1);

        expect(window.confirm).toHaveBeenCalled();
        expect(store.dispatch).not.toHaveBeenCalledWith(TrajetActions.deleteTrajet({id: 1}));
    });

    it('should show alert on delete failure', () => {
        vi.spyOn(window, 'alert').mockImplementation(() => {
        });

        actions$.next(TrajetActions.deleteTrajetFailure({error: 'Erreur'}));

        expect(window.alert).toHaveBeenCalledWith("Impossible de supprimer ce trajet.");
    });
});