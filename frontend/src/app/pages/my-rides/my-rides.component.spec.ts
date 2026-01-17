import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyRidesComponent } from './my-rides.component';
import { TrajetService } from '../../services/trajet.service';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

describe('MyRidesComponent', () => {
  let component: MyRidesComponent;
  let fixture: ComponentFixture<MyRidesComponent>;
  let trajetServiceMock: any;

  const mockTrajets = [
    { id: 1, villeDepart: 'Paris', villeArrivee: 'Lyon', dateHeureDepart: '2025-05-01T10:00', placesDisponibles: 3 },
    { id: 2, villeDepart: 'Lille', villeArrivee: 'Bruxelles', dateHeureDepart: '2025-06-15T14:00', placesDisponibles: 2 }
  ];

  beforeEach(async () => {
    trajetServiceMock = {
      getMyTrajets: vi.fn().mockReturnValue(of(mockTrajets))
    };

    await TestBed.configureTestingModule({
      imports: [MyRidesComponent],
      providers: [
        { provide: TrajetService, useValue: trajetServiceMock },
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
    const cards = fixture.debugElement.queryAll(By.css('.card'));
    expect(cards.length).toBe(2);
  });

  it('should display correct information in the card', () => {
    const firstCardTitle = fixture.debugElement.query(By.css('.card-title')).nativeElement;
    expect(firstCardTitle.textContent).toContain('Paris ➝ Lyon');
  });
});