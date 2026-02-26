import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Trajet} from '../../models/trajet.model';
import {RouterLink} from "@angular/router";
import {MapComponent} from "../../components/map/map.component";
import {Store} from '@ngrx/store';
import {Actions, ofType} from '@ngrx/effects';
import {Subscription} from 'rxjs';
import * as TrajetActions from '../../store/trajet/trajet.actions';
import * as TrajetSelectors from '../../store/trajet/trajet.selectors';
import { ReservationService } from '../../services/reservation.service';

@Component({
    selector: 'app-my-rides',
    standalone: true,
    imports: [CommonModule, RouterLink, MapComponent],
    templateUrl: './my-rides.component.html',
    styleUrls: ['./my-rides.component.scss']
})
export class MyRidesComponent implements OnInit, OnDestroy {
    trajets: Trajet[] = [];
    selectedTrajet: Trajet | null = null;
    isLoading = true;
    passagersMap: { [key: number]: any[] } = {};

    private subscription: Subscription = new Subscription();

    constructor(
        private store: Store,
        private actions$: Actions,
        private reservationService: ReservationService
    ) {}

    ngOnInit(): void {
        this.store.dispatch(TrajetActions.loadTrajets());

        this.subscription.add(
            this.store.select(TrajetSelectors.selectAllTrajets).subscribe(data => {
                this.trajets = data;

                if (data && data.length > 0) {
                    data.forEach(trajet => {
                        if (trajet.id) {
                            this.fetchPassagers(trajet.id);
                        }
                    });
                }
            })
        );

        this.subscription.add(
            this.store.select(TrajetSelectors.selectTrajetsLoading).subscribe(loading => {
                this.isLoading = loading;
            })
        );

        this.subscription.add(
            this.actions$.pipe(ofType(TrajetActions.loadTrajetsFailure)).subscribe((action) => {
                console.error('Erreur de chargement', action.error);
                this.isLoading = false;
            })
        );

        this.subscription.add(
            this.actions$.pipe(ofType(TrajetActions.deleteTrajetFailure)).subscribe((action) => {
                console.error('Erreur lors de la suppression', action.error);
                alert("Impossible de supprimer ce trajet.");
            })
        );
    }

    /**
     * Appelle le service pour récupérer les passagers d'un trajet spécifique
     * et les stocke dans la map.
     */
    private fetchPassagers(rideId: number): void {
        this.reservationService.getReservationsForRide(rideId).subscribe({
            next: (res) => {
                this.passagersMap[rideId] = res;
            },
            error: (err) => {
                console.error(`Erreur passagers pour le trajet ${rideId}`, err);
                this.passagersMap[rideId] = [];
            }
        });
    }

    isDeletable(dateHeureDepart: string): boolean {
        const now = new Date();
        const depart = new Date(dateHeureDepart);
        const diffMs = depart.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        return diffHours >= 24;
    }

    deleteTrajet(id: number): void {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce trajet ?')) {
            this.store.dispatch(TrajetActions.deleteTrajet({id}));
        }
    }

    selectTrajet(trajet: Trajet): void {
        this.selectedTrajet = trajet;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}