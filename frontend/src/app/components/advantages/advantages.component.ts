import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface Advantage {
  stat: string;
  statLabelKey: string;
  statColor: string;
  titleKey: string;
  descriptionKey: string;
}

@Component({
  selector: 'app-advantages',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './advantages.component.html',
  styleUrls: ['./advantages.component.scss']
})
export class AdvantagesComponent {
  advantages: Advantage[] = [
    {
      stat: '0€',
      statLabelKey: 'LANDING.ADV_FREE_STAT_LABEL',
      statColor: '#10b981',
      titleKey: 'LANDING.ADV_FREE_TITLE',
      descriptionKey: 'LANDING.ADV_FREE_DESC'
    },
    {
      stat: '-60%',
      statLabelKey: 'LANDING.ADV_ECO_STAT_LABEL',
      statColor: '#8b5cf6',
      titleKey: 'LANDING.ADV_ECO_TITLE',
      descriptionKey: 'LANDING.ADV_ECO_DESC'
    },
    {
      stat: '💬',
      statLabelKey: 'LANDING.ADV_MSG_STAT_LABEL',
      statColor: '#6b7280',
      titleKey: 'LANDING.ADV_MSG_TITLE',
      descriptionKey: 'LANDING.ADV_MSG_DESC'
    },
    {
      stat: '🗺️',
      statLabelKey: 'LANDING.ADV_MAP_STAT_LABEL',
      statColor: '#6b7280',
      titleKey: 'LANDING.ADV_MAP_TITLE',
      descriptionKey: 'LANDING.ADV_MAP_DESC'
    }
  ];

  trackByIndex(index: number): number {
    return index;
  }
}
