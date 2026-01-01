import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Role } from '../../models/role.enum';
import { FormsModule } from '@angular/forms';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let userServiceMock: any;
  let authServiceMock: any;

  // Données fictives pour les tests
  const dummyUser = {
    id: 1,
    firstname: 'Jean',
    lastname: 'Test',
    email: 'jean@test.com',
    role: Role.CLIENT,
    pointBalance: 100
  };

  beforeEach(async () => {
    userServiceMock = {
      getMyProfile: vi.fn().mockReturnValue(of(dummyUser)),
      updateProfile: vi.fn()
    };

    authServiceMock = {
      logout: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, FormsModule],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Déclenche ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('devrait charger le profil au démarrage', () => {
    expect(userServiceMock.getMyProfile).toHaveBeenCalled();
    expect(component.user).toEqual(dummyUser);
  });

  it('doit sauvegarder le profil et afficher un message de succès', () => {
    // On simule une réponse de mise à jour réussie
    userServiceMock.updateProfile.mockReturnValue(of({ ...dummyUser, firstname: 'Modifié' }));

    // On met composant en mode édition
    component.isEditing = true;
    if (component.user) component.user.firstname = 'Modifié';

    // Action
    component.saveProfile();

    // Vérifications
    expect(userServiceMock.updateProfile).toHaveBeenCalled();
    expect(component.user?.firstname).toBe('Modifié');
    expect(component.isEditing).toBe(false); // Doit repasser en mode lecture
    expect(component.successMessage).toContain('succès');
  });

  it('doit appeler authService.logout() lors de la déconnexion', () => {
    component.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
  });
});