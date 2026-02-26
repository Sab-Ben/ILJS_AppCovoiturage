import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  image: string;
  title: string;
  description: string;
  step: string;
  dotColor: string;
}

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './how-it-works.component.html',
  styleUrls: ['./how-it-works.component.scss']
})
export class HowItWorksComponent {
  steps: Step[] = [
    {
      image: 'https://images.unsplash.com/photo-1764347923709-fc48487f2486?w=600&h=400&fit=crop&q=80',
      title: 'Trouvez un trajet',
      description: 'Recherchez parmi les trajets disponibles sur la carte interactive.',
      step: 'Étape 1',
      dotColor: '#3b82f6'
    },
    {
      image: 'assets/images/depensez-points.png',
      title: 'Dépensez vos points',
      description: 'Réservez votre place avec vos points selon la distance.',
      step: 'Étape 2',
      dotColor: '#8b5cf6'
    },
    {
      image: 'assets/images/voyagez-ensemble.png',
      title: 'Voyagez ensemble',
      description: 'Retrouvez votre conducteur et partagez la route.',
      step: 'Étape 3',
      dotColor: '#f59e0b'
    },
    {
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=400&fit=crop&q=80',
      title: 'Conduisez & gagnez',
      description: 'Proposez vos trajets et gagnez des points à chaque passager.',
      step: 'Étape 4',
      dotColor: '#ef4444'
    }
  ];

  trackByIndex(index: number): number {
    return index;
  }
}
