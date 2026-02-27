import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ReservationService } from '../../services/reservation.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

export interface MyReservationDto {
  id: number;
  seats: number;
  createdAt?: string;
  ride: {
    id: number;
    from: string;
    to: string;
    date: string;
    departureTime?: string;
    availableSeats?: number;
    driverName?: string;
  };
}

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmModalComponent],
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.scss'],
})
export class MyReservationsComponent implements OnInit, OnDestroy {
  loading = false;
  errorMsg: string | null = null;
  reservations: MyReservationDto[] = [];
  showCancelModal = false;
  reservationToCancel: MyReservationDto | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private reservationService: ReservationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading = true;
    this.errorMsg = null;

    this.reservationService
      .getMyReservations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.reservations = data ?? [];
          this.loading = false;
        },
        error: () => {
          this.errorMsg = 'Erreur lors du chargement des réservations.';
          this.loading = false;
        },
      });
  }

  openCancelModal(r: MyReservationDto): void {
    this.reservationToCancel = r;
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.reservationToCancel = null;
  }

  confirmCancel(): void {
    if (!this.reservationToCancel) return;
    const reservation = this.reservationToCancel;
    this.closeCancelModal();
    this.reservationService.cancelReservation(reservation.id).subscribe({
      next: () => {
        this.toastService.success('Annulation', 'Réservation annulée avec succès');
        this.loadReservations();
      },
      error: (err) => {
        this.toastService.error('Erreur', err?.error?.message || 'Impossible d\'annuler cette réservation.');
      },
    });
  }

  trackById(_: number, r: MyReservationDto): number {
    return r.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
