import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CreateReservationRequest {
  rideId: number;
  seats: number;
  desiredRoute: string;
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
  private readonly apiUrl = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  reserveRide(trajetId: number): Observable<ReservationDto> {
    return this.http.post<ReservationDto>(`${this.apiUrl}/trajets/${trajetId}/reservations`, {});
  }

  getMyReservations(): Observable<ReservationDto[]> {
    return this.http.get<ReservationDto[]>(`${this.apiUrl}/me`);
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
