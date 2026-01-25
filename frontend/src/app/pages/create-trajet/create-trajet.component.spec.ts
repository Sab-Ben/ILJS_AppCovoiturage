import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateTrajetComponent } from './create-trajet.component';
import { TrajetService } from '../../services/trajet.service';
import { GeocodingService } from '../../services/geocoding.service';
import { RoutingService } from '../../services/routing.service';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('CreateTrajetComponent', () => {
  let component: CreateTrajetComponent;
  let fixture: ComponentFixture<CreateTrajetComponent>;
  let trajetServiceMock: any;
  let geocodingServiceMock: any;
  let routingServiceMock: any;

  const getRelativeDate = (daysToAdd: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0];
  };

  beforeEach(async () => {
    trajetServiceMock = {
      createTrajet: vi.fn().mockReturnValue(of({}))
    };

    geocodingServiceMock = {
      getCoordinates: vi.fn().mockReturnValue(of([48.85, 2.35]))
    };

    routingServiceMock = {
      getRouteData: vi.fn().mockReturnValue(of({ distanceKm: 450.5, duree: '4h 15min' }))
    };

    await TestBed.configureTestingModule({
      imports: [CreateTrajetComponent, ReactiveFormsModule],
      providers: [
        { provide: TrajetService, useValue: trajetServiceMock },
        { provide: GeocodingService, useValue: geocodingServiceMock },
        { provide: RoutingService, useValue: routingServiceMock },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTrajetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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

  it('should call service with formatted data AND routing info on submit', () => {
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

    component.addEtape();
    component.etapesControls.at(1).setValue('');

    component.addEtape();
    component.etapesControls.at(2).setValue('Mâcon');

    component.onSubmit();

    expect(geocodingServiceMock.getCoordinates).toHaveBeenCalled();

    expect(routingServiceMock.getRouteData).toHaveBeenCalled();

    expect(trajetServiceMock.createTrajet).toHaveBeenCalledWith(expect.objectContaining({
      villeDepart: 'Paris',
      villeArrivee: 'Lyon',
      dateHeureDepart: `${tomorrow}T08:00:00`,
      placesDisponibles: 3,
      etapes: ['Auxerre', 'Mâcon'],
      distanceKm: 450.5,
      dureeEstimee: '4h 15min'
    }));
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
    expect(trajetServiceMock.createTrajet).not.toHaveBeenCalled();
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

    expect(component.trajetForm.get('placesDisponibles')?.hasError('max')).toBe(true);

    component.onSubmit();
    expect(trajetServiceMock.createTrajet).not.toHaveBeenCalled();
  });

  it('should not submit if form is invalid (empty fields)', () => {
    component.onSubmit();
    expect(trajetServiceMock.createTrajet).not.toHaveBeenCalled();
  });
});