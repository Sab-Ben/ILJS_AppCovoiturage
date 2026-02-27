import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CreateReservationRequest {
  rideId: number;
  seats: number;
  desiredRoute: string; // ✅ requis
}

export type ReservationStatus = 'RESERVED' | 'COMPLETED' | 'CANCELLED';

export interface ReservationDto {
  id: number;
  seats: number;
  status: ReservationStatus;
  createdAt?: string;
  passagerName?: string;
  passagerEmail?: string;

  ride: {
    id: number;
    from: string;
    to: string;
    date: string;
    departureTime?: string;
    availableSeats?: number;
    price?: number;
    driverName?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly apiUrl = `${environment.apiUrl}/reservations`; // -> /api/v1/reservations

  constructor(private http: HttpClient) {}

  createReservation(payload: CreateReservationRequest): Observable<ReservationDto> {
    return this.http.post<ReservationDto>(this.apiUrl, payload);
  }

  reserveRide(trajetId: number): Observable<ReservationDto> {
    return this.http.post<ReservationDto>(`${this.apiUrl}/trajets/${trajetId}/reservations`, {});
  }

  // ✅ AJOUT : récupérer "mes réservations" (réservées / effectuées / annulées)
  getMyReservations(status: ReservationStatus): Observable<ReservationDto[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<ReservationDto[]>(`${this.apiUrl}/me`, { params });
  }

  getAllMyReservations(): Observable<ReservationDto[]> {
    return this.http.get<ReservationDto[]>(`${this.apiUrl}/reservations/me`);
  }

  isAlreadyReserved(trajetId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/trajets/${trajetId}/is-reserved`);
  }

  getMyReservationForRide(trajetId: number): Observable<ReservationDto | null> {
    return this.http.get<ReservationDto>(`${this.apiUrl}/trajets/${trajetId}/my-reservation`).pipe(
      catchError(() => of(null))
    );
  }

  getReservationsByRide(trajetId: number): Observable<ReservationDto[]> {
    return this.http.get<ReservationDto[]>(`${this.apiUrl}/trajets/${trajetId}/reservations`);
  }

  cancelReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
