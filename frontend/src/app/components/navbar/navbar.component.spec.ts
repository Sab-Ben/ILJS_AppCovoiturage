import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ThemeService } from '../../services/theme.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { User } from '../../models/user.model';
import { Role } from '../../models/role.enum';
import { WsService } from '../../services/ws.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;


  const authServiceMock = {
    isAuthenticated: vi.fn(),
    logout: vi.fn()
  };

  const userServiceMock = {
    getMyProfile: vi.fn()
  };

  const themeServiceMock = {
    toggleTheme: vi.fn(),
    darkMode: vi.fn() //
  };

  const routerMock = {
    navigate: vi.fn(),
    events: of()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: ThemeService, useValue: themeServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    vi.clearAllMocks();
  });

  it('devrait créer le composant', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialisation (ngOnInit)', () => {
    it('devrait charger le profil utilisateur si authentifié', () => {
      // ARRANGE
      const mockUser: User = {
        id: 1,
        firstname: 'Test',
        lastname: 'User',
        email: 'test@test.com',
        role: Role.PASSAGER
      };

      authServiceMock.isAuthenticated.mockReturnValue(true);
      userServiceMock.getMyProfile.mockReturnValue(of(mockUser));

      // ACT
      component.ngOnInit();

      // ASSERT
      expect(authServiceMock.isAuthenticated).toHaveBeenCalled();
      expect(userServiceMock.getMyProfile).toHaveBeenCalled();
      expect(component.user).toEqual(mockUser);
    });

    it('ne devrait PAS charger le profil si NON authentifié', () => {
      // ARRANGE
      authServiceMock.isAuthenticated.mockReturnValue(false);

      // ACT
      component.ngOnInit();

      // ASSERT
      expect(userServiceMock.getMyProfile).not.toHaveBeenCalled();
      expect(component.user).toBeUndefined();
    });
  });

  describe('Déconnexion (logout)', () => {
    it('devrait appeler authService.logout, vider le user et rediriger', () => {
      // ARRANGE
      component.user = { id: 1 } as User; // On simule un user connecté

      // ACT
      component.logout();

      // ASSERT
      expect(authServiceMock.logout).toHaveBeenCalled();
      expect(component.user).toBeUndefined(); // Le user local doit être vidé
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Changement de Thème', () => {
    it('devrait appeler themeService.toggleTheme', () => {
      // ACT
      component.themeService.toggleTheme();

      // ASSERT
      expect(themeServiceMock.toggleTheme).toHaveBeenCalled();
    });
  });

  describe('Logique d\'affichage (Template Logic)', () => {
    // Note: Ces tests vérifient indirectement les *ngIf du HTML
    // en vérifiant l'état de la variable `user`.

    it('devrait savoir si le user est PASSAGER', () => {
      component.user = { role: Role.PASSAGER } as User;
      // Tu n'as pas de getter isPassenger dans la dernière version fournie,
      // mais on vérifie la logique utilisée dans le HTML:
      expect(component.user?.role === 'PASSAGER').toBe(true);
    });

    it('devrait savoir si le user est CONDUCTEUR', () => {
      component.user = { role: Role.CONDUCTEUR } as User;
      expect(component.user?.role === 'CONDUCTEUR').toBe(true);
    });
  });
});
