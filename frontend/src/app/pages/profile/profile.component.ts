import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { User } from '../../models/user.model';
import { Role } from '../../models/role.enum';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Observable, Subscription } from 'rxjs';
import * as UserActions from '../../store/user/user.actions';
import * as UserSelectors from '../../store/user/user.selectors';
import * as AuthActions from '../../store/authentification/authentification.actions';
import * as TrajetActions from '../../store/trajet/trajet.actions';
import * as TrajetSelectors from '../../store/trajet/trajet.selectors';
import * as PointActions from '../../store/point/point.actions';
import * as PointSelectors from '../../store/point/point.selectors';
import { Trajet } from '../../models/trajet.model';
import { PointBalance } from '../../models/point-balance.model';
import { LevelBadgeComponent } from '../../components/level-badge/level-badge.component';
import { PointsHistoryComponent } from '../../components/points-history/points-history.component';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';
import { ToastService } from '../../services/toast.service';
import { PointService } from '../../services/point.service';
import { ReservationService, ReservationDto } from '../../services/reservation.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LevelBadgeComponent, PointsHistoryComponent, ConfirmModalComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User | undefined;
  isEditing = false;
  successMessage = '';
  roles = Object.values(Role);
  trajets$: Observable<Trajet[]>;
  trajetsLoading$: Observable<boolean>;
  activeTab: 'rides' | 'bookings' | 'history' = 'rides';
  balance: PointBalance | null = null;
  myReservations: ReservationDto[] = [];
  reservationsLoading = false;
  showCancelModal = false;
  reservationToCancel: ReservationDto | null = null;
  isTestMode = environment.testMode;
  testEnCours = false;
  testResultat: string | null = null;
  debugInfo: string | null = null;

  private subscription: Subscription = new Subscription();

  constructor(
    private store: Store,
    private actions$: Actions,
    private toastService: ToastService,
    private pointService: PointService,
    private reservationService: ReservationService
  ) {
    this.trajets$ = this.store.select(TrajetSelectors.selectAllTrajets);
    this.trajetsLoading$ = this.store.select(TrajetSelectors.selectTrajetsLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(UserActions.loadMyProfile());
    this.store.dispatch(TrajetActions.loadTrajets());
    this.store.dispatch(PointActions.loadBalance());
    this.loadMyReservations();
    this.showWelcomeToastIfNeeded();

    this.subscription.add(
      this.store.select(UserSelectors.selectCurrentUser).subscribe(data => {
        if (data) this.user = { ...data };
      })
    );

    this.subscription.add(
      this.store.select(PointSelectors.selectBalance).subscribe(balance => {
        this.balance = balance;
      })
    );

    this.subscription.add(
      this.actions$.pipe(ofType(UserActions.updateProfileSuccess)).subscribe(() => {
        this.isEditing = false;
        this.successMessage = 'Profil mis à jour avec succès !';
        setTimeout(() => this.successMessage = '', 3000);
      })
    );
  }

  get initials(): string {
    if (!this.user) return '';
    const first = this.user.firstname?.charAt(0) || '';
    const last = this.user.lastname?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  get nextLevelThreshold(): number {
    return this.balance?.nextLevelThreshold ?? this.balance?.currentLevelThreshold ?? 300;
  }

  get progressPercent(): number {
    return this.balance?.levelProgressPercent ?? 0;
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  saveProfile(): void {
    if (this.user) {
      this.store.dispatch(UserActions.updateProfile({ user: this.user }));
    }
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  lancerTestCompletion(): void {
    this.testEnCours = true;
    this.testResultat = null;
    this.pointService.testCompletion().subscribe({
      next: (result) => {
        this.testEnCours = false;
        const gained = result['pointsGagnes'] as number;
        const after = result['pointsApres'] as number;
        this.testResultat = `+${gained} points ! Solde: ${after}`;
        this.toastService.success(
          'Test reussi !',
          `Le conducteur a recu ${gained} points pour le trajet Casablanca -> Rabat. Nouveau solde: ${after}`,
          10000
        );
        this.store.dispatch(PointActions.loadBalance());
      },
      error: () => {
        this.testEnCours = false;
        this.testResultat = 'Erreur lors du test';
        this.toastService.error('Erreur', 'Le test a echoue. Verifiez les logs backend.');
      }
    });
  }

  voirDebugTrajets(): void {
    this.pointService.debugTrajets().subscribe({
      next: (data) => {
        this.debugInfo = JSON.stringify(data, null, 2);
      },
      error: () => {
        this.debugInfo = 'Erreur lors du chargement';
      }
    });
  }

  loadMyReservations(): void {
    this.reservationsLoading = true;
    this.reservationService.getAllMyReservations().subscribe({
      next: (data) => {
        this.myReservations = data ?? [];
        this.reservationsLoading = false;
      },
      error: () => {
        this.myReservations = [];
        this.reservationsLoading = false;
      }
    });
  }

  isRidePast(r: ReservationDto): boolean {
    if (!r.ride?.date) return false;
    const rideDate = new Date(r.ride.date + (r.ride.departureTime ? 'T' + r.ride.departureTime : 'T23:59:59'));
    return rideDate.getTime() < Date.now();
  }

  openCancelModal(r: ReservationDto): void {
    this.reservationToCancel = r;
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.reservationToCancel = null;
  }

  confirmCancelReservation(): void {
    if (!this.reservationToCancel) return;
    const reservation = this.reservationToCancel;
    this.closeCancelModal();
    this.reservationService.cancelReservation(reservation.id).subscribe({
      next: () => {
        this.toastService.success('Annulation', 'Réservation annulée avec succès');
        this.loadMyReservations();
      },
      error: (err) => {
        this.toastService.error('Erreur', err?.error?.message || 'Impossible d\'annuler cette réservation.');
      }
    });
  }

  private showWelcomeToastIfNeeded(): void {
    const isNewUser = sessionStorage.getItem('showWelcomeToast');
    if (isNewUser) {
      sessionStorage.removeItem('showWelcomeToast');
      setTimeout(() => {
        this.toastService.success(
          'Bienvenue dans la communauté !',
          'Vous avez reçu 30 points de bienvenue pour commencer votre aventure.',
          10000
        );
      }, 500);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
