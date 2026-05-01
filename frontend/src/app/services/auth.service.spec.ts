import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { vi } from 'vitest';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;
    let routerMock: any;

    beforeEach(() => {
        routerMock = {
            navigate: vi.fn()
        };

        sessionStorage.clear();

        TestBed.configureTestingModule({
            providers: [
                AuthService,
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: Router, useValue: routerMock }
            ]
        });

        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('devrait stocker le token dans le sessionStorage après un login réussi', () => {
        const mockResponse = { token: 'fake-jwt-token' };
        const credentials = { email: 'test@test.com', password: '123' };

        service.login(credentials).subscribe(() => {
            expect(sessionStorage.getItem('token')).toBe('fake-jwt-token');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
    });

    it('devrait supprimer le token et rediriger lors du logout', () => {
        // Préparation : on met un token
        sessionStorage.setItem('token', 'old-token');

        service.logout();

        expect(sessionStorage.getItem('token')).toBeNull();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('isAuthenticated doit renvoyer true si un token existe', () => {
        sessionStorage.setItem('token', 'valid-token');
        expect(service.isAuthenticated()).toBe(true);
    });

    it('isAuthenticated doit renvoyer false si aucun token', () => {
        expect(service.isAuthenticated()).toBe(false);
    });
});