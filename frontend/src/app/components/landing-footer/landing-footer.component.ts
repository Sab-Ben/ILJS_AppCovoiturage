import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

@Component({
  selector: 'app-landing-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-footer.component.html',
  styleUrls: ['./landing-footer.component.scss']
})
export class LandingFooterComponent {
  columns: FooterColumn[] = [
    {
      title: 'Produit',
      links: [
        { label: 'Fonctionnalités', href: '#' },
        { label: 'Sécurité', href: '#' },
        { label: 'Tarification', href: '#' },
        { label: 'Roadmap', href: '#' }
      ]
    },
    {
      title: 'Entreprise',
      links: [
        { label: 'À propos', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Carrières', href: '#' },
        { label: 'Presse', href: '#' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Documentation', href: '#' },
        { label: 'Centre d\'aide', href: '#' },
        { label: 'Contact', href: '#' },
        { label: 'Statut', href: '#' }
      ]
    }
  ];

  currentYear = new Date().getFullYear();

  trackByIndex(index: number): number {
    return index;
  }
}
