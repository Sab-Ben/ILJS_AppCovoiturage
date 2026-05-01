import { Component } from '@angular/core';
import { LandingNavbarComponent } from '../../components/landing-navbar/landing-navbar.component';
import { HeroSectionComponent } from '../../components/hero-section/hero-section.component';
import { HowItWorksComponent } from '../../components/how-it-works/how-it-works.component';
import { AdvantagesComponent } from '../../components/advantages/advantages.component';
import { TestimonialsComponent } from '../../components/testimonials/testimonials.component';
import { GetStartedComponent } from '../../components/get-started/get-started.component';
import { LandingFooterComponent } from '../../components/landing-footer/landing-footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    LandingNavbarComponent,
    HeroSectionComponent,
    HowItWorksComponent,
    AdvantagesComponent,
    TestimonialsComponent,
    GetStartedComponent,
    LandingFooterComponent
  ],
  template: `
    <app-landing-navbar />
    <app-hero-section />
    <app-how-it-works />
    <app-advantages />
    <app-testimonials />
    <app-get-started />
    <app-landing-footer />
  `,
  styles: [':host { display: block; background-color: var(--bg); color: var(--fg); min-height: 100vh; transition: background-color 0.3s ease, color 0.3s ease; }']
})
export class LandingComponent {}
