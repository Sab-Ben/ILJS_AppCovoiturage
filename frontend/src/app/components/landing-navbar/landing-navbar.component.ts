import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface NavSection {
  id: string;
  labelKey: string;
}

@Component({
  selector: 'app-landing-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './landing-navbar.component.html',
  styleUrls: ['./landing-navbar.component.scss']
})
export class LandingNavbarComponent implements OnInit, OnDestroy {
  isScrolled = false;
  isMobileMenuOpen = false;
  activeSection = '';
  isDarkMode = true;

  navSections: NavSection[] = [
    { id: 'comment-ca-marche', labelKey: 'NAV.HOW_IT_WORKS' },
    { id: 'avantages', labelKey: 'NAV.ADVANTAGES' },
    { id: 'temoignages', labelKey: 'NAV.TESTIMONIALS' }
  ];

  private scrollObserver: IntersectionObserver | undefined;

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private languageService: LanguageService,
    private translateService: TranslateService
  ) {
    this.isDarkMode = this.themeService.darkMode();
  }

  get currentLang(): string {
    return this.languageService.getCurrentLang();
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

  switchLanguage(): void {
    const next = this.currentLang === 'fr' ? 'en' : 'fr';
    this.languageService.switchLanguage(next);
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
      this.router.navigate(['/dashboard']);
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
