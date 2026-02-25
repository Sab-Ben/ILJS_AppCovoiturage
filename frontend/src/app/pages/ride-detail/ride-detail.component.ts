import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';

import { RideService } from '../../services/ride.service';
import { MapService } from '../../services/map.service';
import { Ride } from '../../models/ride.model';
import * as ReservationActions from '../../store/reservation/reservation.actions';

@Component({
  selector: 'app-ride-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './ride-detail.component.html',
  styleUrls: ['./ride-detail.component.scss'],
})
export class RideDetailComponent implements OnInit, OnDestroy {
  ride: Ride | null = null;
  selectedSeats = 1;

  desiredRoute = '';

  successMsg: string | null = null;
  lastReservationId: number | null = null;
  lastReservedSeats = 0;

  loading = false;
  errorMsg: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private rideService: RideService,
      private mapService: MapService,
      private store: Store,
      private actions$: Actions
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap
        .pipe(takeUntil(this.destroy$))
        .subscribe((qp) => {
          const seats = Number(qp.get('seats') ?? '1');
          this.selectedSeats = Number.isFinite(seats) && seats > 0 ? seats : 1;
        });

    this.loading = true;
    this.route.paramMap
        .pipe(
            takeUntil(this.destroy$),
            switchMap((params) => {
              const id = params.get('id');
              if (!id) throw new Error('ID course manquant');
              return this.rideService.getRideById(id);
            })
        )
        .subscribe({
          next: async (ride) => {
            this.ride = ride;
            this.loading = false;
            this.errorMsg = null;

            const center =
                (ride as any).fromLat != null && (ride as any).fromLng != null
                    ? ([(ride as any).fromLat, (ride as any).fromLng] as [number, number])
                    : ([48.8566, 2.3522] as [number, number]);

            setTimeout(async () => {
              try {
                this.mapService.initMap('ride-map', center, 12);

                if (
                    (ride as any).fromLat != null &&
                    (ride as any).fromLng != null &&
                    (ride as any).toLat != null &&
                    (ride as any).toLng != null
                ) {
                  await this.mapService.drawRoute(
                      (ride as any).fromLat,
                      (ride as any).fromLng,
                      (ride as any).toLat,
                      (ride as any).toLng
                  );
                } else {
                  this.errorMsg = 'Coordonnées manquantes pour afficher l’itinéraire.';
                }
              } catch (e: any) {
                this.errorMsg = e?.message ?? 'Erreur affichage carte/itinéraire';
              }
            }, 0);
          },
          error: (err: any) => {
            this.loading = false;
            this.ride = null;
            this.errorMsg = err?.message ?? 'Erreur chargement course';
          },
        });

    this.actions$
        .pipe(ofType(ReservationActions.createReservationSuccess), takeUntil(this.destroy$))
        .subscribe((res: any) => {
          this.loading = false;
          this.successMsg = 'Réservation confirmée ✅';

          this.lastReservationId = res.reservation?.id;
          this.lastReservedSeats = this.selectedSeats;

          if (this.ride && (this.ride as any).availableSeats != null) {
            (this.ride as any).availableSeats =
                Number((this.ride as any).availableSeats) - this.selectedSeats;
          }

          this.router.navigate(['/my-reservations']);
        });

    this.actions$
        .pipe(ofType(ReservationActions.createReservationFailure), takeUntil(this.destroy$))
        .subscribe((action: any) => {
          this.loading = false;
          console.error(action.error);
          this.errorMsg = action.error?.error?.message ?? 'Impossible de réserver (erreur serveur)';
        });

    this.actions$
        .pipe(ofType(ReservationActions.cancelReservationSuccess), takeUntil(this.destroy$))
        .subscribe(() => {
          this.loading = false;
          this.successMsg = 'Réservation annulée ✅';

          if (this.ride && (this.ride as any).availableSeats != null) {
            (this.ride as any).availableSeats =
                Number((this.ride as any).availableSeats) + this.lastReservedSeats;
          }

          this.lastReservationId = null;
          this.lastReservedSeats = 0;
        });

    this.actions$
        .pipe(ofType(ReservationActions.cancelReservationFailure), takeUntil(this.destroy$))
        .subscribe((action: any) => {
          this.loading = false;
          console.error(action.error);
          this.errorMsg = action.error?.error?.message ?? 'Impossible d’annuler (moins de 2h avant le départ)';
        });
  }

  reserve(): void {
    if (!this.ride) return;

    this.errorMsg = null;
    this.successMsg = null;

    if (!this.desiredRoute.trim()) {
      this.errorMsg = 'Veuillez indiquer le trajet souhaité.';
      return;
    }

    const availableSeats = Number((this.ride as any).availableSeats ?? 0);
    if (availableSeats && this.selectedSeats > availableSeats) {
      this.errorMsg = 'Pas assez de places disponibles.';
      return;
    }

    const payload = {
      rideId: Number((this.ride as any).id),
      seats: this.selectedSeats,
      desiredRoute: this.desiredRoute.trim(),
    };

    if (!payload.rideId || Number.isNaN(payload.rideId)) {
      this.errorMsg = "Impossible de réserver : id du trajet invalide.";
      return;
    }

    this.loading = true;
    this.store.dispatch(ReservationActions.createReservation({ payload }));
  }

  cancel(): void {
    if (!this.lastReservationId || !this.ride) return;

    if (!confirm('Annuler cette réservation ? (possible uniquement jusqu’à 2h avant)')) return;

    this.loading = true;
    this.errorMsg = null;
    this.successMsg = null;

    this.store.dispatch(ReservationActions.cancelReservation({ id: this.lastReservationId }));
  }

  ngOnDestroy(): void {
    this.mapService.clearRoute();
    this.destroy$.next();
    this.destroy$.complete();
  }
}