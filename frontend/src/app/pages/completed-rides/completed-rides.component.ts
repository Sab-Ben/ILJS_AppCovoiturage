import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TrajetService } from '../../services/trajet.service';
import { CompletedRide } from '../../models/completed-ride.model';

@Component({
  selector: 'app-completed-rides',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './completed-rides.component.html',
  styleUrls: ['./completed-rides.component.scss']
})
export class CompletedRidesComponent implements OnInit {
  rides: CompletedRide[] = [];
  loading = true;
  errorMsg: string | null = null;

  constructor(private trajetService: TrajetService) {}

  ngOnInit(): void {
    this.trajetService.getCompletedTrajets().subscribe({
      next: (data) => {
        this.rides = data;
        this.loading = false;
      },
      error: () => {
        this.errorMsg = "Impossible de charger les courses effectuées.";
        this.loading = false;
      }
    });
  }
}
