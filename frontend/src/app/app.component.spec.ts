import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Component } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component'; // Ajuste le chemin si besoin
import { provideRouter } from '@angular/router';

// 1. On crée un composant Mock (Faux) pour remplacer la vraie Navbar
// Cela évite de devoir importer AuthService, UserService, etc. ici.
@Component({
  selector: 'app-navbar',
  standalone: true,
  template: ''
})
class MockNavbarComponent {}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      // On fournit un routeur vide pour que <router-outlet> fonctionne
      providers: [provideRouter([])]
    })
        // 2. On remplace la vraie Navbar par la MockNavbar dans le test
        .overrideComponent(AppComponent, {
          remove: { imports: [NavbarComponent] },
          add: { imports: [MockNavbarComponent] }
        })
        .compileComponents();
  });

  it('devrait créer l\'application', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`devrait avoir le titre 'IJLS Covoiturage.'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('IJLS Covoiturage.');
  });

  it('devrait afficher la navbar', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges(); // Déclenche le rendu HTML
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('app-navbar')).not.toBeNull();
  });

  it('devrait contenir le router-outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });
});