import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LevelBadgeComponent } from './level-badge.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as PointSelectors from '../../store/point/point.selectors';
import { PointBalance } from '../../models/point-balance.model';

describe('LevelBadgeComponent', () => {
    let component: LevelBadgeComponent;
    let fixture: ComponentFixture<LevelBadgeComponent>;
    let store: MockStore;

    const mockBalance: PointBalance = {
        currentBalance: 150,
        totalEarned: 250,
        level: 'EXPLORATEUR',
        levelLabel: 'Explorateur',
        levelRank: 2,
        nextLevel: 'VOYAGEUR',
        nextLevelLabel: 'Voyageur',
        pointsToNextLevel: 350,
        nextLevelThreshold: 600,
        currentLevelThreshold: 200,
        levelProgressPercent: 12.5
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LevelBadgeComponent],
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: PointSelectors.selectBalance, value: mockBalance }
                    ]
                })
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LevelBadgeComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(MockStore);
        vi.spyOn(store, 'dispatch');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('doit afficher le niveau courant', () => {
        expect(component.currentLevelConfig.name).toBe('EXPLORATEUR');
        expect(component.balance?.levelLabel).toBe('Explorateur');
    });

    it('doit calculer la progression correctement', () => {
        expect(component.progressPercent).toBe(12.5);
    });

    it('doit afficher les points restants vers le prochain niveau', () => {
        expect(component.pointsRemaining).toBe(350);
    });

    it('doit identifier les niveaux atteints', () => {
        const debutant = component.allLevels[0];
        const explorateur = component.allLevels[1];
        const voyageur = component.allLevels[2];

        expect(component.isLevelReached(debutant)).toBe(true);
        expect(component.isLevelReached(explorateur)).toBe(true);
        expect(component.isLevelReached(voyageur)).toBe(false);
    });

    it('doit identifier le niveau courant', () => {
        const explorateur = component.allLevels[1];
        const voyageur = component.allLevels[2];

        expect(component.isCurrentLevel(explorateur)).toBe(true);
        expect(component.isCurrentLevel(voyageur)).toBe(false);
    });
});
