import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Role } from '../../models/role.enum';
import { FormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let userServiceMock: any;
  let authServiceMock: any;

  const passagerUser = {
    id: 1,
    firstname: 'Jean',
    lastname: 'Test',
    email: 'jean@test.com',
    role: Role.PASSAGER,
    pointBalance: 100
  };

  beforeEach(async () => {
    userServiceMock = {
      getMyProfile: vi.fn().mockReturnValue(of(passagerUser)),
      updateProfile: vi.fn()
    };

    authServiceMock = {
      logout: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, FormsModule],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('devrait charger le profil au démarrage', () => {
    expect(userServiceMock.getMyProfile).toHaveBeenCalled();
    expect(component.user).toEqual(passagerUser);
  });

  it('doit sauvegarder le profil et afficher un message de succès', () => {
    userServiceMock.updateProfile.mockReturnValue(of({ ...passagerUser, firstname: 'Modifié' }));
    component.isEditing = true;
    if (component.user) component.user.firstname = 'Modifié';

    component.saveProfile();

    expect(userServiceMock.updateProfile).toHaveBeenCalled();
    expect(component.user?.firstname).toBe('Modifié');
    expect(component.isEditing).toBe(false);
    expect(component.successMessage).toContain('succès');
  });

  it('doit appeler authService.logout() lors de la déconnexion', () => {
    component.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
  });

  it('devrait afficher Rechercher une course et Mes réservations pour PASSAGER', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('button[routerlink="/search-ride"]')).toBeTruthy();
    expect(compiled.querySelector('button[routerlink="/passenger/bookings"]')).toBeTruthy();
  });

});
