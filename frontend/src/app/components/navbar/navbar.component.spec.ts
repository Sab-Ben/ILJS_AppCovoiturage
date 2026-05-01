import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ThemeService } from '../../services/theme.service';
import { WsService } from '../../services/ws.service';
import { ToastService } from '../../services/toast.service';
import { Router, ActivatedRoute } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { User } from '../../models/user.model';
import { Role } from '../../models/role.enum';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  const authServiceMock = {
    isAuthenticated: vi.fn(),
    logout: vi.fn(),
    getToken: vi.fn().mockReturnValue('fake-token')
  };

  const userServiceMock = {
    getMyProfile: vi.fn()
  };

  const themeServiceMock = {
    toggleTheme: vi.fn(),
    darkMode: vi.fn()
  };

  const wsServiceMock = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    subscribeToUserNotifications: vi.fn().mockReturnValue({ unsubscribe: vi.fn() })
  };

  const toastServiceMock = {
    show: vi.fn(),
    success: vi.fn(),
    error: vi.fn()
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
        { provide: WsService, useValue: wsServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: {} },
        provideMockStore()
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
    it('devrait connecter le WebSocket et charger le profil si authentifié', () => {
      const mockUser: User = {
        id: 1,
        firstname: 'Test',
        lastname: 'User',
        email: 'test@test.com',
        role: Role.PASSAGER
      };

      authServiceMock.isAuthenticated.mockReturnValue(true);
      userServiceMock.getMyProfile.mockReturnValue(of(mockUser));

      component.ngOnInit();

      expect(wsServiceMock.connect).toHaveBeenCalled();
      expect(userServiceMock.getMyProfile).toHaveBeenCalled();
      expect(component.user).toEqual(mockUser);
      expect(wsServiceMock.subscribeToUserNotifications).toHaveBeenCalledWith(1, expect.any(Function));
    });

    it('ne devrait PAS charger le profil si NON authentifié', () => {
      authServiceMock.isAuthenticated.mockReturnValue(false);

      component.ngOnInit();

      expect(wsServiceMock.connect).not.toHaveBeenCalled();
      expect(userServiceMock.getMyProfile).not.toHaveBeenCalled();
      expect(component.user).toBeUndefined();
    });
  });

  describe('Déconnexion (logout)', () => {
    it('devrait déconnecter le WebSocket, logout et rediriger', () => {
      component.user = { id: 1 } as User;

      component.logout();

      expect(wsServiceMock.disconnect).toHaveBeenCalled();
      expect(authServiceMock.logout).toHaveBeenCalled();
      expect(component.user).toBeUndefined();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/auth']);
    });
  });
});
