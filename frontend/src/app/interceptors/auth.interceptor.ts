import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const platformId = inject(PLATFORM_ID); // On récupère l'ID de la plateforme

    // Si on n'est pas dans le navigateur, on laisse passer la requête sans rien faire
    if (!isPlatformBrowser(platformId)) {
        return next(req);
    }

    // Si on est dans le navigateur, on peut utiliser localStorage
    const token = localStorage.getItem('token');

    if (token) {
        const cloned = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(cloned);
    }

    return next(req);
};