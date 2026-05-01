import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';

import { RideService } from '../../services/ride.service';
import { Ride } from '../../models/ride.model';
import * as ReservationActions from '../../store/reservation/reservation.actions';

@Component({
  selector: 'app-ride-results',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ride-results.component.html',
  styleUrls: ['./ride-results.component.scss'],
})
export class RideResultsComponent implements OnInit, OnDestroy {
  from = '';
  to = '';
  date = '';
  seats = 1;

  rides: Ride[] = [];
  loading = false;
  errorMsg: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rideService: RideService,
    private store: Store,
    private actions$: Actions
  ) {
    this.actions$.pipe(
      ofType(ReservationActions.reserveRideSuccess),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.router.navigate(['/my-reservations']);
    });

    this.actions$.pipe(
      ofType(ReservationActions.reserveRideFailure),
      takeUntil(this.destroy$)
    ).subscribe(({ error }) => {
      alert(error || 'Erreur lors de la réservation.');
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((qp) => {
        this.from = qp.get('from') ?? '';
        this.to = qp.get('to') ?? '';
        this.date = qp.get('date') ?? '';
        this.seats = Number(qp.get('seats') ?? '1') || 1;

        this.fetchRides();
      });
  }

  fetchRides(): void {
    if (!this.from || !this.to || !this.date) {
      this.rides = [];
      this.errorMsg = 'Veuillez renseigner Départ, Arrivée et Date.';
      return;
    }

    this.loading = true;
    this.errorMsg = null;

    this.rideService
      .searchRides(this.from, this.to, this.date)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rides) => {
          this.rides = rides ?? [];
          this.loading = false;
          if (this.rides.length === 0) this.errorMsg = 'Aucun trajet trouvé.';
        },
        error: (err) => {
          console.error(err);
          this.errorMsg = 'Erreur lors de la recherche.';
          this.loading = false;
        },
      });
  }

  getDepartureTime(ride: Ride): string {
    return (ride as any).departureTime ?? '';
  }

  getAvailableSeats(ride: Ride): number {
    const v = (ride as any).availableSeats ?? (ride as any).seatsAvailable ?? 0;
    return Number(v) || 0;
  }

  getDriverName(ride: Ride): string {
    return (
      (ride as any).driverName ??
      (ride as any).driver?.firstname ??
      (ride as any).driver?.name ??
      '—'
    );
  }

  book(ride: Ride): void {
    if (!ride?.id) {
      alert("Impossible de réserver : id du trajet manquant.");
      return;
    }

    const available = this.getAvailableSeats(ride);
    const seatsToBook = this.seats || 1;

    if (available <= 0) {
      alert('Plus de place disponible pour ce trajet.');
      return;
    }
    if (seatsToBook > available) {
      alert(`Il ne reste que ${available} place(s) disponible(s).`);
      return;
    }

    this.store.dispatch(ReservationActions.reserveRide({ rideId: Number(ride.id) }));
  }

  goBackToSearch(): void {
    this.router.navigate(['/search-ride'], {
      queryParams: {
        from: this.from,
        to: this.to,
        date: this.date,
        seats: this.seats,
      },
    });
  }

  trackByRideId(index: number, ride: Ride): number | string {
    return ride.id ?? index;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
