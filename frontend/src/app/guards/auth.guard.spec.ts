import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { vi } from 'vitest';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('AuthGuard', () => {
    let authServiceMock: any;
    let routerMock: any;

    const routeMock = {} as ActivatedRouteSnapshot;
    const stateMock = { url: '/dashboard' } as RouterStateSnapshot;

    beforeEach(() => {
        authServiceMock = {
            isAuthenticated: vi.fn()
        };
        routerMock = {
            navigate: vi.fn()
        };

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: Router, useValue: routerMock }
            ]
        });
    });

    it('devrait laisser passer si l\'utilisateur est authentifié', () => {
        authServiceMock.isAuthenticated.mockReturnValue(true);

        const result = TestBed.runInInjectionContext(() => authGuard(routeMock, stateMock));

        expect(result).toBe(true);
        expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('devrait bloquer et rediriger vers /login si non authentifié', () => {
        authServiceMock.isAuthenticated.mockReturnValue(false);

        const result = TestBed.runInInjectionContext(() => authGuard(routeMock, stateMock));

        expect(result).toBe(false);
        expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });
});