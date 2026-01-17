import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CreateTrajetComponent} from './create-trajet.component';
import {ReactiveFormsModule} from '@angular/forms';
import {TrajetService} from '../../services/trajet.service';
import {Router} from '@angular/router';
import {vi} from 'vitest';
import {of} from 'rxjs';

describe('CreateTrajetComponent', () => {
  let component: CreateTrajetComponent;
  let fixture: ComponentFixture<CreateTrajetComponent>;
  let trajetServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    trajetServiceMock = {
      createTrajet: vi.fn().mockReturnValue(of({}))
    };

    routerMock = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [CreateTrajetComponent, ReactiveFormsModule],
      providers: [
        { provide: TrajetService, useValue: trajetServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTrajetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form should be invalid when empty', () => {
    expect(component.trajetForm.valid).toBeFalsy();
  });

  it('form should be valid when filled correctly', () => {
    component.trajetForm.controls['villeDepart'].setValue('Paris');
    component.trajetForm.controls['villeArrivee'].setValue('Marseille');
    component.trajetForm.controls['dateDepart'].setValue('2025-06-01');
    component.trajetForm.controls['heureDepart'].setValue('08:00');
    component.trajetForm.controls['placesDisponibles'].setValue(2);

    expect(component.trajetForm.valid).toBeTruthy();
  });

  it('should call createTrajet on submit if form is valid', () => {
    component.trajetForm.setValue({
      villeDepart: 'Nice',
      villeArrivee: 'Cannes',
      dateDepart: '2025-07-14',
      heureDepart: '10:00',
      placesDisponibles: 4
    });

    component.onSubmit();

    expect(trajetServiceMock.createTrajet).toHaveBeenCalledWith({
      villeDepart: 'Nice',
      villeArrivee: 'Cannes',
      dateHeureDepart: '2025-07-14T10:00:00',
      placesDisponibles: 4
    });

    expect(routerMock.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should not call service if form is invalid', () => {
    component.onSubmit();
    expect(trajetServiceMock.createTrajet).not.toHaveBeenCalled();
  });
});