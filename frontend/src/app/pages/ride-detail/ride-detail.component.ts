import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { RideService } from '../../services/ride.service';
import { MapService } from '../../services/map.service';
import { WsService } from '../../services/ws.service';
import { Ride } from '../../models/ride.model';
import { ReservationService, ReservationDto } from '../../services/reservation.service';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';
import { StompSubscription } from '@stomp/stompjs';
import * as UserSelectors from '../../store/user/user.selectors';

@Component({
  selector: 'app-ride-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ConfirmModalComponent, TranslateModule],
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
  alreadyReserved = false;
  showCancelModal = false;

  isOwner = false;
  currentUserEmail = '';
  rideReservations: ReservationDto[] = [];
  loadingReservations = false;

  private destroy$ = new Subject<void>();
  private rideSub: StompSubscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rideService: RideService,
    private mapService: MapService,
    private reservationService: ReservationService,
    private wsService: WsService,
    private store: Store,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.store.select(UserSelectors.selectCurrentUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.currentUserEmail = user.email;
          this.checkOwnership();
        }
      });

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
          if (!id) throw new Error('ID missing');
          return this.rideService.getRideById(id);
        })
      )
      .subscribe({
        next: async (ride) => {
          this.ride = ride;
          this.loading = false;
          this.errorMsg = null;

          this.checkOwnership();

          const rideId = Number((ride as any).id);
          if (!this.isOwner) {
            this.checkIfAlreadyReserved(rideId);
          }
          this.subscribeToSeatsUpdates(rideId);

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
                this.errorMsg = this.translateService.instant('RIDES.MISSING_COORDS');
              }
            } catch (e: any) {
              this.errorMsg = e?.message ?? this.translateService.instant('RIDES.MAP_ERROR');
            }
          }, 0);
        },
        error: (err: any) => {
          this.loading = false;
          this.ride = null;
          this.errorMsg = err?.message ?? this.translateService.instant('RIDES.LOAD_ERROR');
        },
      });
  }

  reserve(): void {
    if (!this.ride) return;

    this.errorMsg = null;
    this.successMsg = null;

    const availableSeats = Number((this.ride as any).availableSeats ?? 0);
    if (availableSeats && this.selectedSeats > availableSeats) {
      this.errorMsg = this.translateService.instant('RIDES.NO_SEATS_ERROR');
      return;
    }

    const rideId = Number((this.ride as any).id);
    if (!rideId || Number.isNaN(rideId)) {
      this.errorMsg = this.translateService.instant('RIDES.INVALID_ID_ERROR');
      return;
    }

    this.loading = true;

    this.reservationService
      .reserveRide(rideId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.successMsg = this.translateService.instant('RIDES.RESERVATION_CONFIRMED');
          this.alreadyReserved = true;

          this.lastReservationId = res.id;
          this.lastReservedSeats = 1;

          if (this.ride && (this.ride as any).availableSeats != null) {
            (this.ride as any).availableSeats =
              Number((this.ride as any).availableSeats) - 1;
          }

          this.router.navigate(['/my-reservations']);
        },
        error: (err: unknown) => {
          this.loading = false;
          const httpErr = err as { error?: { message?: string } };
          this.errorMsg =
            httpErr?.error?.message ?? this.translateService.instant('RIDES.SERVER_ERROR');
        },
      });
  }

  openCancelModal(): void {
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
  }

  confirmCancel(): void {
    this.showCancelModal = false;

    if (!this.lastReservationId || !this.ride) return;

    this.loading = true;
    this.errorMsg = null;
    this.successMsg = null;

    this.reservationService
      .cancelReservation(this.lastReservationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.successMsg = this.translateService.instant('RIDES.CANCEL_RESERVATION_SUCCESS');

          if (this.ride && (this.ride as any).availableSeats != null) {
            (this.ride as any).availableSeats =
              Number((this.ride as any).availableSeats) + this.lastReservedSeats;
          }

          this.lastReservationId = null;
          this.lastReservedSeats = 0;
          this.alreadyReserved = false;
        },
        error: (err: any) => {
          this.loading = false;
          console.error(err);
          this.errorMsg =
            err?.error?.message ?? this.translateService.instant('RIDES.CANCEL_RESERVATION_ERROR');
        },
      });
  }

  getRideId(): number | null {
    if (!this.ride) return null;
    return Number((this.ride as any).id) || null;
  }

  getPassengerInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n.charAt(0).toUpperCase()).join('');
  }

  formatReservationDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    const normalized = dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : dateStr + 'Z';
    const date = new Date(normalized);
    const lang = this.translateService.currentLang || 'fr';
    return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  private checkOwnership(): void {
    if (!this.ride || !this.currentUserEmail) return;
    const wasOwner = this.isOwner;
    this.isOwner = this.ride.driverEmail === this.currentUserEmail;
    if (this.isOwner && !wasOwner) {
      this.loadRideReservations();
    }
  }

  private loadRideReservations(): void {
    if (!this.ride) return;
    const rideId = Number((this.ride as any).id);
    if (!rideId || Number.isNaN(rideId)) return;

    this.loadingReservations = true;
    this.reservationService.getReservationsByRide(rideId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reservations) => {
          this.rideReservations = reservations;
          this.loadingReservations = false;
        },
        error: () => {
          this.loadingReservations = false;
        }
      });
  }

  private subscribeToSeatsUpdates(trajetId: number): void {
    this.rideSub?.unsubscribe();
    this.rideSub = this.wsService.subscribeToRideUpdates(trajetId, (event) => {
      if (event.type === 'SEATS_UPDATED' && this.ride) {
        (this.ride as any).availableSeats = event.payload.availableSeats;
      }
      if (this.isOwner) {
        this.loadRideReservations();
      }
    });
  }

  private checkIfAlreadyReserved(trajetId: number): void {
    if (!trajetId || Number.isNaN(trajetId)) return;
    this.reservationService.getMyReservationForRide(trajetId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reservation) => {
          if (reservation) {
            this.alreadyReserved = true;
            this.lastReservationId = reservation.id;
            this.lastReservedSeats = reservation.seats;
          } else {
            this.alreadyReserved = false;
          }
        },
        error: () => this.alreadyReserved = false
      });
  }

  ngOnDestroy(): void {
    this.rideSub?.unsubscribe();
    this.mapService.clearRoute();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
