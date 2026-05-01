import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapComponent } from './map.component';
import { GeocodingService } from '../../services/geocoding.service';
import { RoutingService } from '../../services/routing.service';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SimpleChange } from '@angular/core';

vi.mock('leaflet', () => {
  const mapMock: any = {
    removeLayer: vi.fn(),
    fitBounds: vi.fn(),
    addLayer: vi.fn(),
    setView: vi.fn().mockReturnThis()
  };

  const markerMock = {
    addTo: vi.fn().mockReturnThis(),
    bindPopup: vi.fn().mockReturnThis(),
    openPopup: vi.fn().mockReturnThis()
  };

  const geoJSONMock = {
    addTo: vi.fn().mockReturnThis(),
    getBounds: vi.fn().mockReturnValue({})
  };

  const boundsMock = { extend: vi.fn(), isValid: vi.fn().mockReturnValue(true) };

  const L = {
    map: vi.fn().mockReturnValue(mapMock),
    tileLayer: vi.fn().mockReturnValue({ addTo: vi.fn() }),
    marker: vi.fn().mockReturnValue(markerMock),
    geoJSON: vi.fn().mockReturnValue(geoJSONMock),

    Icon: vi.fn(),
    icon: vi.fn(),

    latLngBounds: vi.fn().mockReturnValue(boundsMock),
    Marker: { prototype: { options: {} } }
  };
  return { ...L, default: L };
});

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let geocodingServiceMock: any;
  let routingServiceMock: any;

  beforeEach(async () => {
    // Initialisation avec des valeurs par défaut pour éviter undefined.pipe
    geocodingServiceMock = { getCoordinates: vi.fn().mockReturnValue(of(null)) };

    routingServiceMock = {
      getRouteData: vi.fn().mockReturnValue(of({
        distanceKm: 200, duree: '2h', geometry: { type: 'LineString', coordinates: [] }
      }))
    };

    await TestBed.configureTestingModule({
      imports: [MapComponent],
      providers: [
        { provide: GeocodingService, useValue: geocodingServiceMock },
        { provide: RoutingService, useValue: routingServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => { vi.clearAllMocks(); });

  it('should include intermediate steps (waypoints) in markers and routing', async () => {
    // GIVEN
    geocodingServiceMock.getCoordinates.mockImplementation((city: string) => {
      if (city === 'Paris') return of([48.85, 2.35]);
      if (city === 'Orléans') return of([47.90, 1.90]);
      if (city === 'Lyon') return of([45.76, 4.83]);
      return of(null);
    });

    component.villeDepart = 'Paris';
    component.villeArrivee = 'Lyon';
    component.etapes = ['Orléans'];

    // WHEN
    component.ngOnChanges({
      villeDepart: new SimpleChange(null, 'Paris', true),
      villeArrivee: new SimpleChange(null, 'Lyon', true),
      etapes: new SimpleChange(null, ['Orléans'], true)
    });

    const L = await import('leaflet');

    // THEN
    expect(L.default.marker).toHaveBeenCalledTimes(3);

    const markerInstance = L.default.marker([0,0]);
    expect(markerInstance.bindPopup).toHaveBeenCalledWith(expect.stringContaining('Étape'));
    expect(markerInstance.bindPopup).toHaveBeenCalledWith(expect.stringContaining('Orléans'));

    expect(routingServiceMock.getRouteData).toHaveBeenCalledWith(
        expect.arrayContaining([
          [48.85, 2.35],
          [47.90, 1.90],
          [45.76, 4.83]
        ])
    );
  });
});