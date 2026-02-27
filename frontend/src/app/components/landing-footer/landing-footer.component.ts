import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface FooterLink {
  labelKey: string;
  href: string;
}

interface FooterColumn {
  titleKey: string;
  links: FooterLink[];
}

@Component({
  selector: 'app-landing-footer',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './landing-footer.component.html',
  styleUrls: ['./landing-footer.component.scss']
})
export class LandingFooterComponent {
  columns: FooterColumn[] = [
    {
      titleKey: 'LANDING.FOOTER_COL1_TITLE',
      links: [
        { labelKey: 'LANDING.FOOTER_COL1_LINK1', href: '#' },
        { labelKey: 'LANDING.FOOTER_COL1_LINK2', href: '#' },
        { labelKey: 'LANDING.FOOTER_COL1_LINK3', href: '#' },
        { labelKey: 'LANDING.FOOTER_COL1_LINK4', href: '#' }
      ]
    },
    {
      titleKey: 'LANDING.FOOTER_COL2_TITLE',
      links: [
        { labelKey: 'LANDING.FOOTER_COL2_LINK1', href: '#' },
        { labelKey: 'LANDING.FOOTER_COL2_LINK2', href: '#' },
        { labelKey: 'LANDING.FOOTER_COL2_LINK3', href: '#' },
        { labelKey: 'LANDING.FOOTER_COL2_LINK4', href: '#' }
      ]
    },
    {
      titleKey: 'LANDING.FOOTER_COL3_TITLE',
      links: [
        { labelKey: 'LANDING.FOOTER_COL3_LINK1', href: '#' },
        { labelKey: 'LANDING.FOOTER_COL3_LINK2', href: '#' },
        { labelKey: 'LANDING.FOOTER_COL3_LINK3', href: '#' },
        { labelKey: 'LANDING.FOOTER_COL3_LINK4', href: '#' }
      ]
    }
  ];

  currentYear = new Date().getFullYear();

  trackByIndex(index: number): number {
    return index;
  }
}
