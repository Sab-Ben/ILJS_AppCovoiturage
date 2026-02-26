import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Advantage {
  stat: string;
  statLabel: string;
  statColor: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-advantages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './advantages.component.html',
  styleUrls: ['./advantages.component.scss']
})
export class AdvantagesComponent {
  advantages: Advantage[] = [
    {
      stat: '0€',
      statLabel: 'toujours gratuit',
      statColor: '#10b981',
      title: '100% Gratuit',
      description: 'Aucun échange d\'argent. Gagnez des points en conduisant, dépensez-les en voyageant.'
    },
    {
      stat: '-60%',
      statLabel: 'de CO₂',
      statColor: '#8b5cf6',
      title: 'Écologique',
      description: 'Réduisez votre empreinte carbone en partageant votre véhicule avec d\'autres voyageurs.'
    },
    {
      stat: '💬',
      statLabel: 'en temps réel',
      statColor: '#6b7280',
      title: 'Messagerie intégrée',
      description: 'Communiquez directement avec conducteurs et passagers. Notifications in-app et email.'
    },
    {
      stat: '🗺️',
      statLabel: 'temps réel',
      statColor: '#6b7280',
      title: 'Carte interactive',
      description: 'Visualisez les trajets, définissez des étapes et estimez distance et durée automatiquement.'
    }
  ];

  trackByIndex(index: number): number {
    return index;
  }
}
