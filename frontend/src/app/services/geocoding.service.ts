import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class GeocodingService {
    private apiUrl = 'https://api-adresse.data.gouv.fr/search/';

    constructor(private http: HttpClient) {}

    /**
     * Recherche d'adresses pour l'autocomplétion.
     * @param query Le texte saisi par l'utilisateur (ex: "8 bd du port")
     */
    searchAddresses(query: string): Observable<any[]> {
        if (!query || query.length < 3) return of([]);

        return this.http.get<any>(`${this.apiUrl}?q=${encodeURIComponent(query)}&limit=5`).pipe(
            retry(2),
            map(response => {
                if (response && response.features) {
                    return response.features.map((feature: any) => ({
                        // On mappe les propriétés pour que votre composant s'y retrouve
                        label: feature.properties.label,           // ex: "8 Boulevard du Port 80000 Amiens"
                        display_name: feature.properties.label,    // Alias pour compatibilité avec votre code existant
                        context: feature.properties.context,       // ex: "80, Somme, Hauts-de-France"
                        coords: feature.geometry.coordinates
                    }));
                }
                return [];
            }),
            catchError(err => {
                console.warn('Erreur API Geocoding :', err);
                return of([]);
            })
        );
    }

    /**
     * Récupère les coordonnées [Latitude, Longitude] pour une adresse donnée.
     * @param address L'adresse complète ou le label choisi
     */
    getCoordinates(address: string): Observable<number[] | null> {
        if (!address) return of(null);

        return this.http.get<any>(`${this.apiUrl}?q=${encodeURIComponent(address)}&limit=1`).pipe(
            retry(2),
            map(response => {
                if (response && response.features && response.features.length > 0) {
                    const coords = response.features[0].geometry.coordinates;
                    return [coords[1], coords[0]];
                }
                return null;
            }),
            catchError(() => of(null))
        );
    }
}