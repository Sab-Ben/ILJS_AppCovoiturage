import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import {environment} from "../../environments/environment";


@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private apiUrl = `${environment.apiUrl}/auth`;

    constructor(
        private http: HttpClient,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    register(registerRequest: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, registerRequest);
    }

    login(authRequest: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, authRequest).pipe(
            tap(response => {
                if (isPlatformBrowser(this.platformId)) {
                    sessionStorage.setItem('token', response.token);
                }
            })
        );
    }

    logout() {
        if (isPlatformBrowser(this.platformId)) {
            sessionStorage.removeItem('token');
        }
        this.router.navigate(['/login']);
    }

    isAuthenticated(): boolean {
        if (isPlatformBrowser(this.platformId)) {
            return !!sessionStorage.getItem('token');
        }
        return false;
    }

    getToken(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return sessionStorage.getItem('token');
        }
        return null;
    }
}