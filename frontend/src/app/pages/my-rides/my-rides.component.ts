import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrajetService } from '../../services/trajet.service';
import { Trajet } from '../../models/trajet.model';
import {RouterLink} from "@angular/router";
import {MapComponent} from "../../components/map/map.component";

@Component({
  selector: 'app-my-rides',
  standalone: true,
  imports: [CommonModule, RouterLink, MapComponent],
  templateUrl: './my-rides.component.html',
  styleUrls: ['./my-rides.component.scss']
})
export class MyRidesComponent implements OnInit {
  trajets: Trajet[] = [];
  selectedTrajet: Trajet | null = null;
  isLoading = true;

  constructor(private trajetService: TrajetService) {}

  ngOnInit(): void {
    this.trajetService.getMyTrajets().subscribe({
      next: (data) => {
        this.trajets = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur de chargement', err);
        this.isLoading = false;
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
      this.trajetService.deleteTrajet(id).subscribe({
        next: () => {
          this.trajets = this.trajets.filter(t => t.id !== id);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression', err);
          alert("Impossible de supprimer ce trajet.");
        }
      });
    }
  }

  selectTrajet(trajet: Trajet): void {
    this.selectedTrajet = trajet;
  }
}