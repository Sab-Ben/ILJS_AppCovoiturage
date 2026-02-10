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
    private subscription: Subscription = new Subscription();

    constructor(
        private store: Store,
        private actions$: Actions
    ) {
    }

    ngOnInit(): void {
        this.store.dispatch(TrajetActions.loadTrajets());

        this.subscription.add(
            this.store.select(TrajetSelectors.selectAllTrajets).subscribe(data => {
                this.trajets = data;
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

        // 5. Gestion spécifique de l'erreur de suppression pour garder votre 'alert'
        this.subscription.add(
            this.actions$.pipe(ofType(TrajetActions.deleteTrajetFailure)).subscribe((action) => {
                console.error('Erreur lors de la suppression', action.error);
                alert("Impossible de supprimer ce trajet.");
            })
        );
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