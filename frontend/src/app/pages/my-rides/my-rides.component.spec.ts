import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyRidesComponent } from './my-rides.component';
import { TrajetService } from '../../services/trajet.service';
import { RoutingService } from '../../services/routing.service';
import { GeocodingService } from '../../services/geocoding.service';
import { of } from 'rxjs';
import { Router, provideRouter } from '@angular/router';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { By } from '@angular/platform-browser';

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

  return {
    ...L,
    default: L
  };
});

describe('MyRidesComponent', () => {
  let component: MyRidesComponent;
  let fixture: ComponentFixture<MyRidesComponent>;
  let trajetServiceMock: any;
  let routingServiceMock: any;
  let geocodingServiceMock: any;
  let router: Router;

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
    trajetServiceMock = {
      getMyTrajets: vi.fn().mockReturnValue(of(mockTrajets)),
      deleteTrajet: vi.fn().mockReturnValue(of(void 0))
    };

    routingServiceMock = { getRouteData: vi.fn().mockReturnValue(of(null)) };
    geocodingServiceMock = { getCoordinates: vi.fn().mockReturnValue(of(null)) };

    await TestBed.configureTestingModule({
      imports: [MyRidesComponent],
      providers: [
        { provide: TrajetService, useValue: trajetServiceMock },
        { provide: RoutingService, useValue: routingServiceMock },
        { provide: GeocodingService, useValue: geocodingServiceMock },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyRidesComponent);
    component = fixture.componentInstance;

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load trajets on init', () => {
    expect(trajetServiceMock.getMyTrajets).toHaveBeenCalled();
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

  it('should delete a ride when user confirms', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    component.trajets[0].dateHeureDepart = futureDate.toISOString();
    fixture.detectChanges();

    component.deleteTrajet(1);

    expect(window.confirm).toHaveBeenCalled();
    expect(trajetServiceMock.deleteTrajet).toHaveBeenCalledWith(1);
    expect(component.trajets.length).toBe(1);
    expect(component.trajets[0].id).toBe(2);
  });

  it('should NOT delete a ride when user cancels', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.deleteTrajet(1);

    expect(window.confirm).toHaveBeenCalled();
    expect(trajetServiceMock.deleteTrajet).not.toHaveBeenCalled();
    expect(component.trajets.length).toBe(2);
  });
});