import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface Step {
  image: string;
  titleKey: string;
  descriptionKey: string;
  stepKey: string;
  dotColor: string;
}

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './how-it-works.component.html',
  styleUrls: ['./how-it-works.component.scss']
})
export class HowItWorksComponent {
  steps: Step[] = [
    {
      image: 'https://images.unsplash.com/photo-1764347923709-fc48487f2486?w=600&h=400&fit=crop&q=80',
      titleKey: 'LANDING.STEP1_TITLE',
      descriptionKey: 'LANDING.STEP1_DESC',
      stepKey: 'LANDING.STEP1_LABEL',
      dotColor: '#3b82f6'
    },
    {
      image: 'assets/images/depensez-points.png',
      titleKey: 'LANDING.STEP2_TITLE',
      descriptionKey: 'LANDING.STEP2_DESC',
      stepKey: 'LANDING.STEP2_LABEL',
      dotColor: '#8b5cf6'
    },
    {
      image: 'assets/images/voyagez-ensemble.png',
      titleKey: 'LANDING.STEP3_TITLE',
      descriptionKey: 'LANDING.STEP3_DESC',
      stepKey: 'LANDING.STEP3_LABEL',
      dotColor: '#f59e0b'
    },
    {
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=400&fit=crop&q=80',
      titleKey: 'LANDING.STEP4_TITLE',
      descriptionKey: 'LANDING.STEP4_DESC',
      stepKey: 'LANDING.STEP4_LABEL',
      dotColor: '#ef4444'
    }
  ];

  trackByIndex(index: number): number {
    return index;
  }
}
