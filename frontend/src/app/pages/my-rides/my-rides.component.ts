import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Important pour *ngFor et *ngIf
import { TrajetService } from '../../services/trajet.service';
import { Trajet } from '../../models/trajet.model';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-my-rides',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-rides.component.html',
  styleUrls: ['./my-rides.component.scss']
})
export class MyRidesComponent implements OnInit {
  trajets: Trajet[] = [];
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
}