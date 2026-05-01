import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from "../services/auth.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();
    const apiUrl = 'http://localhost:8080/api';

    // Vérification : Est-ce que ça va vers notre backend ?
    const isApiRequest = req.url.startsWith(apiUrl);

    if (token && isApiRequest) {
        const cloned = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(cloned);
    }

    return next(req);
};