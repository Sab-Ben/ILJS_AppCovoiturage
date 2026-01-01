import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { Router, provideRouter } from '@angular/router'; // 👈 Import provideRouter
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { FormsModule } from '@angular/forms';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceMock: any;
  let router: Router; // On utilisera le vrai type Router

  beforeEach(async () => {
    // Mock du AuthService
    authServiceMock = {
      register: vi.fn().mockReturnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, FormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        // 👇 SOLUTION MAGIQUE : On fournit un vrai routeur vide
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('doit réussir l\'inscription, afficher le succès et rediriger après 2s', () => {
    vi.useFakeTimers();
    authServiceMock.register.mockReturnValue(of({}));

    component.onSubmit();

    expect(component.successMessage).toContain('Inscription réussie');
    expect(router.navigate).not.toHaveBeenCalled(); // On vérifie l'espion

    vi.advanceTimersByTime(2000);

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    vi.useRealTimers();
  });

  it('doit afficher une erreur spécifique si email déjà utilisé (409)', () => {
    const errorResponse = { status: 409, error: 'Cet email est déjà utilisé.' };
    authServiceMock.register.mockReturnValue(throwError(() => errorResponse));

    component.onSubmit();

    expect(component.errorMessage).toBe('Cet email est déjà utilisé.');
    expect(component.successMessage).toBe('');
  });

  it('doit afficher une erreur générique pour les autres erreurs', () => {
    const errorResponse = { status: 500 };
    authServiceMock.register.mockReturnValue(throwError(() => errorResponse));

    component.onSubmit();

    expect(component.errorMessage).toContain('Une erreur est survenue');
  });
});