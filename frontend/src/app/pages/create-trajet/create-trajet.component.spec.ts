import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CreateTrajetComponent} from './create-trajet.component';
import {GeocodingService} from '../../services/geocoding.service';
import {RoutingService} from '../../services/routing.service';
import {of, Subject} from 'rxjs';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ReactiveFormsModule} from '@angular/forms';
import {provideRouter, Router} from '@angular/router';
import {By} from '@angular/platform-browser';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import * as TrajetActions from '../../store/trajet/trajet.actions';

describe('CreateTrajetComponent', () => {
    let component: CreateTrajetComponent;
    let fixture: ComponentFixture<CreateTrajetComponent>;
    let geocodingServiceMock: any;
    let routingServiceMock: any;
    let store: MockStore;
    let actions$: Subject<any>;
    let router: Router;

    const getRelativeDate = (daysToAdd: number): string => {
        const date = new Date();
        date.setDate(date.getDate() + daysToAdd);
        return date.toISOString().split('T')[0];
    };

    beforeEach(async () => {
        actions$ = new Subject<any>();

        geocodingServiceMock = {
            getCoordinates: vi.fn().mockImplementation((city: string) => {
                if (city === 'Paris') return of([48.85, 2.35]);
                if (city === 'Lyon') return of([45.76, 4.83]);
                if (city === 'Auxerre') return of([47.79, 3.57]);
                return of([0, 0]);
            }),
            searchAddresses: vi.fn().mockReturnValue(of([]))
        };

        routingServiceMock = {
            getRouteData: vi.fn().mockReturnValue(of({distanceKm: 450.5, duree: '4h 15min'}))
        };

        await TestBed.configureTestingModule({
            imports: [CreateTrajetComponent, ReactiveFormsModule],
            providers: [
                {provide: GeocodingService, useValue: geocodingServiceMock},
                {provide: RoutingService, useValue: routingServiceMock},
                provideRouter([]),
                provideMockStore(), // Mock du Store
                provideMockActions(() => actions$)
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(CreateTrajetComponent);
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

    it('should add a step input when "Ajouter une étape" is clicked', () => {
        expect(component.etapesControls.length).toBe(0);
        component.addEtape();
        fixture.detectChanges();
        expect(component.etapesControls.length).toBe(1);
        const inputs = fixture.debugElement.queryAll(By.css('[formArrayName="etapes"] input'));
        expect(inputs.length).toBe(1);
    });

    it('should remove a step when "X" button is clicked', () => {
        component.addEtape();
        component.addEtape();
        component.etapesControls.at(0).setValue('Orléans');
        component.etapesControls.at(1).setValue('Tours');
        fixture.detectChanges();

        expect(component.etapesControls.length).toBe(2);
        component.removeEtape(0);
        fixture.detectChanges();

        expect(component.etapesControls.length).toBe(1);
        expect(component.etapesControls.at(0).value).toBe('Tours');
    });

    it('should dispatch CreateTrajet action and redirect on success', () => {
        vi.useFakeTimers();
        const tomorrow = getRelativeDate(1);

        component.trajetForm.patchValue({
            villeDepart: 'Paris',
            villeArrivee: 'Lyon',
            dateDepart: tomorrow,
            heureDepart: '08:00',
            placesDisponibles: 3
        });

        component.addEtape();
        component.etapesControls.at(0).setValue('Auxerre');

        component.onSubmit();

        expect(geocodingServiceMock.getCoordinates).toHaveBeenCalled();
        expect(routingServiceMock.getRouteData).toHaveBeenCalled();

        expect(store.dispatch).toHaveBeenCalledWith(
            TrajetActions.createTrajet({
                trajet: expect.objectContaining({
                    villeDepart: 'Paris',
                    villeArrivee: 'Lyon',
                    dateHeureDepart: `${tomorrow}T08:00:00`,
                    placesDisponibles: 3,
                    etapes: ['Auxerre'],
                    distanceKm: 450.5,
                    dureeEstimee: '4h 15min'
                })
            })
        );

        actions$.next(TrajetActions.createTrajetSuccess({trajet: {} as any}));

        vi.advanceTimersByTime(1500);
        expect(router.navigate).toHaveBeenCalledWith(['/my-rides']);
    });

    it('should invalidate form if date is past or today', () => {
        const yesterday = getRelativeDate(-1);

        component.trajetForm.patchValue({
            villeDepart: 'Paris',
            villeArrivee: 'Lyon',
            dateDepart: yesterday,
            heureDepart: '10:00',
            placesDisponibles: 1
        });

        fixture.detectChanges();
        expect(component.trajetForm.valid).toBe(false);
        expect(component.trajetForm.get('dateDepart')?.hasError('pastDate')).toBe(true);

        component.onSubmit();
        expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should invalidate form if places > 4', () => {
        const tomorrow = getRelativeDate(1);
        component.trajetForm.patchValue({
            villeDepart: 'Paris',
            villeArrivee: 'Lyon',
            dateDepart: tomorrow,
            heureDepart: '10:00',
            placesDisponibles: 5
        });

        expect(component.trajetForm.valid).toBe(false);
        component.onSubmit();
        expect(store.dispatch).not.toHaveBeenCalled();
    });
});