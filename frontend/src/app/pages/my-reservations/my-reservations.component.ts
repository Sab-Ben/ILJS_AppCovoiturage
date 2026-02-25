import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import * as ReservationActions from '../../store/reservation/reservation.actions';
import { Observable } from 'rxjs';
import { ReservationModel } from '../../models/reservation.model';
import { selectMyReservations, selectReservationLoading } from '../../store/reservation/reservation.selectors';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.scss'],
})
export class MyReservationsComponent implements OnInit {
  reservations$!: Observable<ReservationModel[]>;
  loading$!: Observable<boolean>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.reservations$ = this.store.select(selectMyReservations);
    this.loading$ = this.store.select(selectReservationLoading);

    this.store.dispatch(ReservationActions.loadMyReservations());
  }

  trackById(_: number, r: ReservationModel) {
    return r.id;
  }
}
