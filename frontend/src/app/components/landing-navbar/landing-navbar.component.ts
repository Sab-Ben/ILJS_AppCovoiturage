import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

interface NavSection {
  id: string;
  label: string;
}

@Component({
  selector: 'app-landing-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-navbar.component.html',
  styleUrls: ['./landing-navbar.component.scss']
})
export class LandingNavbarComponent implements OnInit, OnDestroy {
  isScrolled = false;
  isMobileMenuOpen = false;
  activeSection = '';
  isDarkMode = true;

  navSections: NavSection[] = [
    { id: 'comment-ca-marche', label: 'Comment ça marche' },
    { id: 'avantages', label: 'Avantages' },
    { id: 'temoignages', label: 'Témoignages' }
  ];

  private scrollObserver: IntersectionObserver | undefined;

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {
    this.isDarkMode = this.themeService.darkMode();
  }

  ngOnInit(): void {
    this.setupSectionObserver();
  }

  ngOnDestroy(): void {
    this.scrollObserver?.disconnect();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.darkMode();
  }

  handleSmoothScroll(event: MouseEvent, sectionId: string): void {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    this.closeMobileMenu();
  }

  onCommencer(): void {
    this.closeMobileMenu();
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/role-selection']);
    } else {
      this.router.navigate(['/auth']);
    }
  }

  private setupSectionObserver(): void {
    const options = { rootMargin: '-20% 0px -60% 0px', threshold: 0 };

    this.scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.activeSection = entry.target.id;
        }
      });
    }, options);

    setTimeout(() => {
      this.navSections.forEach(section => {
        const element = document.getElementById(section.id);
        if (element) {
          this.scrollObserver!.observe(element);
        }
      });
    }, 500);
  }
}
