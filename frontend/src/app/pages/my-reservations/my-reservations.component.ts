import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { ReservationDto } from '../../services/reservation.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';
import * as ReservationActions from '../../store/reservation/reservation.actions';
import * as ReservationSelectors from '../../store/reservation/reservation.selectors';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmModalComponent],
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.scss'],
})
export class MyReservationsComponent implements OnInit, OnDestroy {
  reservations$!: Observable<ReservationDto[]>;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;

  showCancelModal = false;
  reservationToCancel: ReservationDto | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private actions$: Actions,
    private toastService: ToastService
  ) {
    this.reservations$ = this.store.select(ReservationSelectors.selectMyReservations);
    this.loading$ = this.store.select(ReservationSelectors.selectReservationLoading);
    this.error$ = this.store.select(ReservationSelectors.selectReservationError);
    this.actions$.pipe(
      ofType(ReservationActions.cancelReservationSuccess),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.toastService.success('Annulation', 'Réservation annulée avec succès');
      this.store.dispatch(ReservationActions.loadMyReservations());
    });

    this.actions$.pipe(
      ofType(ReservationActions.cancelReservationFailure),
      takeUntil(this.destroy$)
    ).subscribe(({ error }) => {
      this.toastService.error('Erreur', error || 'Impossible d\'annuler cette réservation.');
    });
  }

  ngOnInit(): void {
    this.store.dispatch(ReservationActions.loadMyReservations());
  }

  openCancelModal(reservation: ReservationDto): void {
    this.reservationToCancel = reservation;
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.reservationToCancel = null;
  }

  confirmCancel(): void {
    if (!this.reservationToCancel) return;
    const reservationId = this.reservationToCancel.id;
    this.closeCancelModal();
    this.store.dispatch(ReservationActions.cancelReservation({ reservationId }));
  }

  trackById(_: number, reservation: ReservationDto): number {
    return reservation.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
