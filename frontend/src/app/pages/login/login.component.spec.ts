import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { FormsModule } from '@angular/forms';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: any;
  let router: Router;

  beforeEach(async () => {
    authServiceMock = {
      login: vi.fn().mockReturnValue(of({ token: 'fake-token' }))
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');

    fixture.detectChanges();
  });

  // Nettoyage après chaque test pour ne pas impacter les suivants
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('doit appeler le service login et rediriger vers /profile en cas de succès', () => {
    // 1. On active les "Fake Timers" de Vitest
    vi.useFakeTimers();

    authServiceMock.login.mockReturnValue(of({ token: 'fake-token' }));

    component.credentials.email = 'test@test.com';
    component.credentials.password = 'Test1234!';

    component.onSubmit();

    // 2. On avance le temps de 1500ms (au lieu de tick(1500))
    vi.advanceTimersByTime(1500);

    // 3. Vérifications
    expect(authServiceMock.login).toHaveBeenCalledWith({ email: 'test@test.com', password: 'Test1234!' });
    expect(router.navigate).toHaveBeenCalledWith(['/profile']);
    expect(component.errorMessage).toBe('');
  });

  it('doit afficher un message d\'erreur si le login échoue', () => {
    authServiceMock.login.mockReturnValue(throwError(() => new Error('Auth failed')));

    component.onSubmit();

    expect(authServiceMock.login).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Identifiants invalides ou erreur de connexion.');
  });
});