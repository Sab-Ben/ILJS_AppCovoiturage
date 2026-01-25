import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapComponent } from './map.component';
import { GeocodingService } from '../../services/geocoding.service';
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

  const polylineMock = {
    addTo: vi.fn().mockReturnThis()
  };

  const tileLayerMock = {
    addTo: vi.fn().mockReturnThis()
  };

  const boundsMock = {
    extend: vi.fn(),
    isValid: vi.fn().mockReturnValue(true)
  };

  const L = {
    map: vi.fn().mockReturnValue(mapMock),
    tileLayer: vi.fn().mockReturnValue(tileLayerMock),
    marker: vi.fn().mockReturnValue(markerMock),
    polyline: vi.fn().mockReturnValue(polylineMock),
    icon: vi.fn(),
    latLngBounds: vi.fn().mockReturnValue(boundsMock),
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
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize the map on view init', async () => {
    const L = await import('leaflet');
    expect(L.default.map).toHaveBeenCalledWith('map');
  });

  it('should update route including intermediate stops', async () => {
    geocodingServiceMock.getCoordinates.mockImplementation((city: string) => {
      if (city === 'Paris') return of([48.85, 2.35]);
      if (city === 'Orléans') return of([47.90, 1.90]);
      if (city === 'Lyon') return of([45.76, 4.83]);
      return of(null);
    });

    component.villeDepart = 'Paris';
    component.villeArrivee = 'Lyon';
    component.etapes = ['Orléans'];

    component.ngOnChanges({
      villeDepart: new SimpleChange(null, 'Paris', true),
      villeArrivee: new SimpleChange(null, 'Lyon', true),
      etapes: new SimpleChange(null, ['Orléans'], true)
    });

    const L = await import('leaflet');

    expect(geocodingServiceMock.getCoordinates).toHaveBeenCalledTimes(3);

    expect(L.default.marker).toHaveBeenCalledTimes(3);

    expect(L.default.polyline).toHaveBeenCalled();
  });
});