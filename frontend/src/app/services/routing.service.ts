import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoutingService {
  // API OSRM publique (Driving = voiture)
  private apiUrl = 'https://router.project-osrm.org/route/v1/driving';

  constructor(private http: HttpClient) {}

  getRouteData(coordinates: number[][]): Observable<{ distanceKm: number, duree: string }> {

    const formattedCoords = coordinates
        .map(coord => `${coord[1]},${coord[0]}`)
        .join(';');

    const url = `${this.apiUrl}/${formattedCoords}?overview=false`;

    return this.http.get<any>(url).pipe(
        map(response => {
          if (!response.routes || response.routes.length === 0) {
            throw new Error('Aucun itinéraire trouvé');
          }

          const route = response.routes[0];

          const distKm = Math.round((route.distance / 1000) * 10) / 10;
          const durationSec = route.duration;

          return {
            distanceKm: distKm,
            duree: this.formatDuration(durationSec)
          };
        })
    );
  }

  // Convertit secondes en "Xh Ymin"
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes}min`;
    }
  }
}