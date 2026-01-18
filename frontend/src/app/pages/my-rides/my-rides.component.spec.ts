import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyRidesComponent } from './my-rides.component';
import { TrajetService } from '../../services/trajet.service';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import {GeocodingService} from "../../services/geocoding.service";

describe('MyRidesComponent', () => {
  let component: MyRidesComponent;
  let fixture: ComponentFixture<MyRidesComponent>;
  let trajetServiceMock: any;
  let geocodingServiceMock: any;

  const today = new Date();

  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 5);

  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - 1);

  const mockTrajets = [
    {
      id: 1,
      villeDepart: 'Paris',
      villeArrivee: 'Lyon',
      dateHeureDepart: futureDate.toISOString(),
      placesDisponibles: 3
    },
    {
      id: 2,
      villeDepart: 'Lille',
      villeArrivee: 'Bruxelles',
      dateHeureDepart: futureDate.toISOString(),
      placesDisponibles: 2
    }
  ];

  beforeEach(async () => {
    trajetServiceMock = {
      getMyTrajets: vi.fn().mockReturnValue(of([...mockTrajets])),
      deleteTrajet: vi.fn().mockReturnValue(of(void 0))
    };

    geocodingServiceMock = {
      getCoordinates: vi.fn().mockReturnValue(of([0, 0]))
    };

    await TestBed.configureTestingModule({
      imports: [MyRidesComponent],
      providers: [
        { provide: TrajetService, useValue: trajetServiceMock },
        { provide: GeocodingService, useValue: geocodingServiceMock },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyRidesComponent);
    component = fixture.componentInstance;
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
    expect(firstCardTitle.textContent).toContain('Paris ➝ Lyon');
  });

  it('should delete a ride when user confirms', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.deleteTrajet(1);

    expect(confirmSpy).toHaveBeenCalled();
    expect(trajetServiceMock.deleteTrajet).toHaveBeenCalledWith(1);

    expect(component.trajets.length).toBe(1);
    expect(component.trajets[0].id).toBe(2);
  });

  it('should NOT delete a ride when user cancels', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.deleteTrajet(1);

    expect(trajetServiceMock.deleteTrajet).not.toHaveBeenCalled();
    expect(component.trajets.length).toBe(2);
  });
});