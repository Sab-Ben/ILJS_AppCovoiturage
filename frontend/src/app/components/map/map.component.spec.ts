import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapComponent } from './map.component';
import { GeocodingService } from '../../services/geocoding.service';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SimpleChange } from '@angular/core';

// --- DEFINITION DU MOCK ---
vi.mock('leaflet', () => {
  // On définit les objets pour pouvoir les référencer circulairement
  const mapMock: any = {
    removeLayer: vi.fn(),
    fitBounds: vi.fn(),
    addLayer: vi.fn(),
    // IMPORTANT : setView doit retourner l'objet map pour permettre le chaînage : L.map().setView()
    setView: vi.fn().mockReturnThis()
  };

  const markerMock = {
    addTo: vi.fn().mockReturnThis(),
    bindPopup: vi.fn().mockReturnThis(),
    openPopup: vi.fn().mockReturnThis()
  };

  const polylineMock = {
    addTo: vi.fn().mockReturnThis()
  };

  const tileLayerMock = {
    addTo: vi.fn().mockReturnThis()
  };

  const L = {
    map: vi.fn().mockReturnValue(mapMock), // L.map() retourne mapMock
    tileLayer: vi.fn().mockReturnValue(tileLayerMock),
    marker: vi.fn().mockReturnValue(markerMock),
    polyline: vi.fn().mockReturnValue(polylineMock),
    icon: vi.fn(),
    latLngBounds: vi.fn(),
    Marker: {
      prototype: { options: {} }
    }
  };

  return {
    ...L,
    default: L
  };
});

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let geocodingServiceMock: any;

  beforeEach(async () => {
    geocodingServiceMock = {
      getCoordinates: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [MapComponent],
      providers: [
        { provide: GeocodingService, useValue: geocodingServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // InitMap est appelé ici
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize the map on view init', async () => {
    const L = await import('leaflet');
    expect(L.default.map).toHaveBeenCalledWith('map');
  });

  it('should update route when inputs change', async () => {
    // Configuration du mock
    geocodingServiceMock.getCoordinates.mockImplementation((city: string) => {
      if (city === 'Paris') return of([48.85, 2.35]);
      if (city === 'Lyon') return of([45.76, 4.83]);
      return of(null);
    });

    // On s'assure que la carte est bien considérée comme initialisée
    // (Grâce au fix du mock setView, this.map devrait être défini)

    // Changement des inputs
    component.villeDepart = 'Paris';
    component.villeArrivee = 'Lyon';

    // Déclenchement manuel du cycle de vie
    component.ngOnChanges({
      villeDepart: new SimpleChange(null, 'Paris', true),
      villeArrivee: new SimpleChange(null, 'Lyon', true)
    });

    const L = await import('leaflet');

    // Vérifications
    expect(geocodingServiceMock.getCoordinates).toHaveBeenCalledWith('Paris');
    expect(geocodingServiceMock.getCoordinates).toHaveBeenCalledWith('Lyon');
    expect(L.default.marker).toHaveBeenCalledTimes(2);
  });
});