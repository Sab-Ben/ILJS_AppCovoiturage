import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ReservationService } from '../../services/reservation.service';


export type ReservationStatus = 'RESERVED' | 'COMPLETED' | 'CANCELLED';

export interface ReservationDto {
  id: number;
  seats: number;
  status: ReservationStatus;
  createdAt?: string;

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

  reserved: ReservationDto[] = [];
  completed: ReservationDto[] = [];

  private destroy$ = new Subject<void>();

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.errorMsg = null;

    // 2 appels (réservées + effectuées)
    this.reservationService
      .getMyReservations('RESERVED')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => (this.reserved = data ?? []),
        error: () => (this.errorMsg = 'Erreur lors du chargement des réservations.'),
      });

    this.reservationService
      .getMyReservations('COMPLETED')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.completed = data ?? [];
          this.loading = false;
        },
        error: () => {
          this.errorMsg = 'Erreur lors du chargement des réservations.';
          this.loading = false;
        },
      });
  }

  switchTab(t: 'reserved' | 'completed'): void {
    this.tab = t;
  }

  canCancel(r: ReservationDto): boolean {
    return r.status === 'RESERVED';
  }

  cancel(r: ReservationDto): void {
    if (!this.canCancel(r)) return;

    const ok = confirm('Annuler cette réservation ?');
    if (!ok) return;

    this.reservationService.cancelReservation(r.id).subscribe({
      next: () => {
        alert('Réservation annulée ✅');
        this.loadAll();
      },
      error: (err) => {
        console.error(err);
        alert(err?.error?.message || 'Erreur lors de l’annulation.');
      },
    });
  }

  trackById(_: number, r: ReservationDto) {
    return r.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
