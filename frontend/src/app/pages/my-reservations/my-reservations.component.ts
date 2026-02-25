import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';

import { Reservation } from '../../models/reservation.model';
import * as ReservationActions from '../../store/reservation/reservation.actions';
import * as ReservationSelectors from '../../store/reservation/reservation.selectors';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.scss'],
})
export class MyReservationsComponent implements OnInit, OnDestroy {
  tab: 'reserved' | 'completed' = 'reserved';

  loading = false;
  errorMsg: string | null = null;

  reserved: Reservation[] = [];
  completed: Reservation[] = [];

  private subscription: Subscription = new Subscription();

  constructor(
      private store: Store,
      private actions$: Actions
  ) {}

  ngOnInit(): void {
    this.loadAll();

    this.subscription.add(
        this.store.select(ReservationSelectors.selectReservedReservations).subscribe(data => {
          this.reserved = data;
        })
    );

    this.subscription.add(
        this.store.select(ReservationSelectors.selectCompletedReservations).subscribe(data => {
          this.completed = data;
        })
    );

    this.subscription.add(
        this.store.select(ReservationSelectors.selectReservationLoading).subscribe(loading => {
          this.loading = loading;
        })
    );

    this.subscription.add(
        this.store.select(ReservationSelectors.selectReservationError).subscribe(error => {
          if (error) this.errorMsg = 'Erreur lors du chargement des réservations.';
        })
    );

    this.subscription.add(
        this.actions$.pipe(ofType(ReservationActions.cancelReservationSuccess)).subscribe(() => {
          alert('Réservation annulée ✅');
          // Optionnel : Recharger tout si tu ne gères pas le retrait auto dans le reducer
          // this.loadAll();
        })
    );

    this.subscription.add(
        this.actions$.pipe(ofType(ReservationActions.cancelReservationFailure)).subscribe((action) => {
          console.error(action.error);
          alert(action.error?.error?.message || 'Erreur lors de l’annulation.');
        })
    );
  }

  loadAll(): void {
    this.errorMsg = null;
    this.store.dispatch(ReservationActions.loadReservations({ status: 'RESERVED' }));
    this.store.dispatch(ReservationActions.loadReservations({ status: 'COMPLETED' }));
  }

  switchTab(t: 'reserved' | 'completed'): void {
    this.tab = t;
  }

  canCancel(r: Reservation): boolean {
    return r.status === 'RESERVED';
  }

  cancel(r: Reservation): void {
    if (!this.canCancel(r)) return;

    const ok = confirm('Annuler cette réservation ?');
    if (!ok) return;

    this.store.dispatch(ReservationActions.cancelReservation({ id: r.id }));
  }

  trackById(_: number, r: Reservation) {
    return r.id;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}