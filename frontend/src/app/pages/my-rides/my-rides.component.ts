import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Trajet} from '../../models/trajet.model';
import {RouterLink} from "@angular/router";
import {MapComponent} from "../../components/map/map.component";
import {ConfirmModalComponent} from '../../components/confirm-modal/confirm-modal.component';
import {Store} from '@ngrx/store';
import {Actions, ofType} from '@ngrx/effects';
import {Subscription} from 'rxjs';
import {ToastService} from '../../services/toast.service';
import * as TrajetActions from '../../store/trajet/trajet.actions';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import * as TrajetSelectors from '../../store/trajet/trajet.selectors';

@Component({
    selector: 'app-my-rides',
    standalone: true,
    imports: [CommonModule, RouterLink, MapComponent, ConfirmModalComponent, TranslateModule],
    templateUrl: './my-rides.component.html',
    styleUrls: ['./my-rides.component.scss']
})
export class MyRidesComponent implements OnInit, OnDestroy {
    trajets: Trajet[] = [];
    selectedTrajet: Trajet | null = null;
    isLoading = true;
    showDeleteModal = false;
    trajetToDelete: Trajet | null = null;
    private subscription: Subscription = new Subscription();

    constructor(
        private store: Store,
        private actions$: Actions,
        private toastService: ToastService
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

        this.subscription.add(
            this.actions$.pipe(ofType(TrajetActions.deleteTrajetFailure)).subscribe((action) => {
                this.toastService.error('Suppression impossible', action.error?.message || 'Impossible de supprimer ce trajet.');
            })
        );

        this.subscription.add(
            this.actions$.pipe(ofType(TrajetActions.deleteTrajetSuccess)).subscribe(() => {
                this.toastService.success('Trajet supprimé', 'Le trajet a été supprimé avec succès.');
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

    isTrajetPast(dateHeureDepart: string): boolean {
        return new Date(dateHeureDepart).getTime() < Date.now();
    }

    openDeleteModal(trajet: Trajet): void {
        this.trajetToDelete = trajet;
        this.showDeleteModal = true;
    }

    closeDeleteModal(): void {
        this.showDeleteModal = false;
        this.trajetToDelete = null;
    }

    confirmDelete(): void {
        if (!this.trajetToDelete?.id) return;
        const id = this.trajetToDelete.id;
        this.closeDeleteModal();
        this.store.dispatch(TrajetActions.deleteTrajet({id}));
    }

    getDeleteModalMessage(): string {
        if (!this.trajetToDelete) return '';
        const trajet = this.trajetToDelete;
        const base = 'Supprimer le trajet ' + trajet.villeDepart + ' → ' + trajet.villeArrivee + ' ?';
        return base + ' Cette action est irréversible. Les passagers ayant réservé seront remboursés et notifiés.';
    }

    selectTrajet(trajet: Trajet): void {
        this.selectedTrajet = trajet;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
