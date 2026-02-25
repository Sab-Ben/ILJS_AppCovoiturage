import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SearchRideComponent} from './search-ride.component';
import {GeocodingService} from '../../services/geocoding.service';
import {provideRouter, Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {of} from 'rxjs';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

describe('SearchRideComponent', () => {
    let component: SearchRideComponent;
    let fixture: ComponentFixture<SearchRideComponent>;
    let router: Router;

    // Mock du GeocodingService
    const mockGeocodingService = {
        searchAddresses: vi.fn(),
        getCoordinates: vi.fn()
    };

    beforeEach(async () => {
        // On utilise les faux timers de Vitest pour gérer le debounceTime(1000)
        vi.useFakeTimers();

        await TestBed.configureTestingModule({
            imports: [SearchRideComponent, FormsModule],
            providers: [
                {provide: GeocodingService, useValue: mockGeocodingService},
                provideRouter([])
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SearchRideComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);

        vi.spyOn(router, 'navigate');
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it('devrait être créé', () => {
        expect(component).toBeTruthy();
    });

    it('devrait charger des suggestions après 1000ms de saisie', async () => {
        fixture.detectChanges();

        const mockResults = [{label: 'Paris, France'}];
        mockGeocodingService.searchAddresses.mockReturnValue(of(mockResults));

        component.onSearchInput('depart', 'Paris');

        vi.advanceTimersByTime(1000);

        await Promise.resolve();
        fixture.detectChanges();

        // 5. VÉRIFICATION
        expect(mockGeocodingService.searchAddresses).toHaveBeenCalledWith('Paris');
        expect(component.suggestionsDepart).toEqual(mockResults);
    });

    it('devrait sélectionner une adresse et vider les suggestions', () => {
        const selectedAddress = {label: 'Lyon, France'};
        component.suggestionsDepart = [selectedAddress];

        component.selectAddress('depart', selectedAddress);

        expect(component.from).toBe('Lyon, France');
        expect(component.suggestionsDepart.length).toBe(0);
    });

    it('devrait naviguer vers les résultats si les adresses sont valides', async () => {
        // Simulation de la résolution des coordonnées
        mockGeocodingService.getCoordinates.mockReturnValue(of([48.85, 2.35]));

        component.from = 'Paris';
        component.to = 'Lyon';
        component.date = '2026-05-20';

        component.onSearch();

        fixture.detectChanges();
        await fixture.whenStable();

        expect(router.navigate).toHaveBeenCalledWith(['/ride-results'], {
            queryParams: {from: 'Paris', to: 'Lyon', date: '2026-05-20'}
        });
        expect(component.searching).toBe(false);
    });

    it('devrait afficher une erreur si l\'adresse de départ est introuvable', async () => {
        // mock : départ introuvable (null), arrivée ok
        mockGeocodingService.getCoordinates
            .mockReturnValueOnce(of(null))
            .mockReturnValueOnce(of([45.75, 4.85]));

        component.from = 'AdresseInconnue';
        component.onSearch();

        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.errorMsg).toContain("Adresse de départ introuvable");
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('devrait réinitialiser le formulaire lors de l\'appel à onReset()', () => {
        component.from = 'Paris';
        component.errorMsg = 'Une erreur';
        component.suggestionsDepart = [{label: 'Test'}];

        component.onReset();

        expect(component.from).toBe('');
        expect(component.errorMsg).toBe('');
        expect(component.suggestionsDepart.length).toBe(0);
    });

    it('devrait vider les suggestions au blur (après un court délai)', async () => {
        component.suggestionsDepart = [{label: 'Paris'}];

        component.clearSuggestions();

        vi.advanceTimersByTime(200);

        expect(component.suggestionsDepart.length).toBe(0);
    });
});