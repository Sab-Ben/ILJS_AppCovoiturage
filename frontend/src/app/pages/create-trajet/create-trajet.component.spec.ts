import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateTrajetComponent } from './create-trajet.component';
import { TrajetService } from '../../services/trajet.service';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('CreateTrajetComponent', () => {
  let component: CreateTrajetComponent;
  let fixture: ComponentFixture<CreateTrajetComponent>;
  let trajetServiceMock: any;

  const getRelativeDate = (daysToAdd: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0];
  };

  beforeEach(async () => {
    trajetServiceMock = {
      createTrajet: vi.fn().mockReturnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [CreateTrajetComponent, ReactiveFormsModule],
      providers: [
        { provide: TrajetService, useValue: trajetServiceMock },
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

  it('should call service with formatted data on submit', () => {
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

    expect(trajetServiceMock.createTrajet).toHaveBeenCalledWith(expect.objectContaining({
      villeDepart: 'Paris',
      villeArrivee: 'Lyon',
      dateHeureDepart: `${tomorrow}T08:00:00`,
      placesDisponibles: 3,
      etapes: ['Auxerre', 'Mâcon']
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


  it('should not submit if form is invalid (empty fields)', () => {
    component.onSubmit();

    expect(trajetServiceMock.createTrajet).not.toHaveBeenCalled();
  });
});