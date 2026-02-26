import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompletedRidesComponent } from './completed-rides.component';
import { TrajetService } from '../../services/trajet.service';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { By } from '@angular/platform-browser';

describe('CompletedRidesComponent', () => {
  let component: CompletedRidesComponent;
  let fixture: ComponentFixture<CompletedRidesComponent>;

  // Création d'un mock pour le service
  const mockTrajetService = {
    getCompletedTrajets: vi.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompletedRidesComponent,],
      providers: [
        { provide: TrajetService, useValue: mockTrajetService },
        provideRouter([]) // Nécessaire car le composant utilise RouterLink
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompletedRidesComponent);
    component = fixture.componentInstance;
  });

  it('devrait créer le composant', () => {
    // On simule une réponse par défaut pour que l'initialisation ne plante pas
    mockTrajetService.getCompletedTrajets.mockReturnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('devrait afficher le message de chargement au début', () => {
    // On simule un observable qui ne répond pas immédiatement
    mockTrajetService.getCompletedTrajets.mockReturnValue(of());
    component.loading = true;
    fixture.detectChanges();

    const infoElement = fixture.debugElement.query(By.css('.info'));
    expect(infoElement.nativeElement.textContent).toContain('Chargement…');
  });

  it('devrait afficher la liste des courses quand le service répond avec succès', () => {
    const mockRides = [
      { id: 1, pointsGagnes: 10, date: '2024-01-01', heure: '10:00', itineraire: 'Paris -> Lyon' },
      { id: 2, pointsGagnes: 20, date: '2024-01-02', heure: '14:00', itineraire: 'Lyon -> Marseille' }
    ];

    mockTrajetService.getCompletedTrajets.mockReturnValue(of(mockRides));

    // Lance le ngOnInit
    fixture.detectChanges();

    expect(component.loading).toBe(false);
    expect(component.rides.length).toBe(2);

    // Vérification du rendu HTML
    const cards = fixture.debugElement.queryAll(By.css('.card'));
    expect(cards.length).toBe(2);
    expect(cards[0].nativeElement.textContent).toContain('Paris -> Lyon');
    expect(cards[0].nativeElement.textContent).toContain('+10 pts');
  });

  it('devrait afficher un message vide si aucune course n\'est retournée', () => {
    mockTrajetService.getCompletedTrajets.mockReturnValue(of([]));
    fixture.detectChanges();

    const emptyMsg = fixture.debugElement.query(By.css('.empty'));
    expect(emptyMsg.nativeElement.textContent).toContain('Aucune course effectuée');
  });

  it('devrait afficher un message d\'erreur en cas d\'échec du service', () => {
    mockTrajetService.getCompletedTrajets.mockReturnValue(throwError(() => new Error('Erreur API')));

    fixture.detectChanges();

    expect(component.loading).toBe(false);
    expect(component.errorMsg).toBe("Impossible de charger les courses effectuées.");

    const errorElement = fixture.debugElement.query(By.css('.error'));
    expect(errorElement.nativeElement.textContent).toContain('Impossible de charger');
  });
});