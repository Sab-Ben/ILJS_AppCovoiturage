import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ride } from '../models/ride.model';

@Injectable({ providedIn: 'root' })
export class RideService {
  private readonly baseUrl = environment.apiUrl;

  // ✅ le back expose /api/v1/trajets/...
  private readonly searchEndpoint = '/trajets/search';
  private readonly rideByIdEndpoint = '/trajets'; // -> GET /trajets/:id

  constructor(private http: HttpClient) {}

  // Réponse API réelle côté back (Trajet) -> mapping vers Ride
  private toRide(api: any): Ride {
    const dt: string = api?.dateHeureDepart ?? '';
    const [d, t] = typeof dt === 'string' ? dt.split('T') : ['', ''];

    const conducteur = api?.conducteur;
    const driverName = conducteur
      ? `${conducteur.firstname ?? ''} ${conducteur.lastname ?? ''}`.trim() || undefined
      : undefined;

    return {
      id: api?.id,
      from: api?.villeDepart ?? '',
      to: api?.villeArrivee ?? '',
      date: d || '',
      departureTime: t ? t.substring(0, 5) : undefined,
      availableSeats: api?.placesDisponibles ?? undefined,
      price: api?.price ?? undefined, // si tu n'as pas "price" côté back, ça restera undefined
      driverName,
      driverEmail: conducteur?.email ?? undefined,
      fromLat: api?.latitudeDepart ?? undefined,
      fromLng: api?.longitudeDepart ?? undefined,
      toLat: api?.latitudeArrivee ?? undefined,
      toLng: api?.longitudeArrivee ?? undefined,
    };
  }

  searchRides(from: string, to: string, date: string): Observable<Ride[]> {
    const params = new HttpParams().set('from', from).set('to', to).set('date', date);

    return this.http
      .get<any[]>(`${this.baseUrl}${this.searchEndpoint}`, { params })
      .pipe(map((rows) => (Array.isArray(rows) ? rows.map((r) => this.toRide(r)) : [])));
  }

  getRideById(id: string | number): Observable<Ride> {
    return this.http
      .get<any>(`${this.baseUrl}${this.rideByIdEndpoint}/${id}`)
      .pipe(map((r) => this.toRide(r)));
  }
}
