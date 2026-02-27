import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PointsHistoryComponent } from './points-history.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as PointSelectors from '../../store/point/point.selectors';
import { PointTransaction } from '../../models/point-transaction.model';

describe('PointsHistoryComponent', () => {
    let component: PointsHistoryComponent;
    let fixture: ComponentFixture<PointsHistoryComponent>;
    let store: MockStore;

    const mockTransactions: PointTransaction[] = [
        {
            id: 1,
            type: 'GAIN_CONDUCTEUR',
            amount: 30,
            description: 'Trajet Casablanca → Rabat (2 passager(s))',
            createdAt: '2026-02-20T14:30:00',
            trajetId: 10
        },
        {
            id: 2,
            type: 'DEPENSE_PASSAGER',
            amount: -15,
            description: 'Réservation trajet Rabat → Fès',
            createdAt: '2026-02-19T09:00:00',
            trajetId: 11
        },
        {
            id: 3,
            type: 'BONUS_INSCRIPTION',
            amount: 30,
            description: "Bonus d'inscription",
            createdAt: '2026-02-18T12:00:00',
            trajetId: null
        }
    ];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PointsHistoryComponent],
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: PointSelectors.selectTransactions, value: mockTransactions },
                        { selector: PointSelectors.selectHistoryLoading, value: false }
                    ]
                })
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PointsHistoryComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(MockStore);
        vi.spyOn(store, 'dispatch');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('doit charger les transactions', () => {
        expect(component.transactions.length).toBe(3);
    });

    it('doit formater les montants positifs avec +', () => {
        expect(component.formatAmount(30)).toBe('+30');
    });

    it('doit formater les montants negatifs', () => {
        expect(component.formatAmount(-15)).toBe('-15');
    });

    it('doit retourner la bonne config par type', () => {
        const config = component.getConfig('GAIN_CONDUCTEUR');
        expect(config.icon).toBe('🚗');
        expect(config.colorClass).toContain('positive');
    });

    it('doit limiter les transactions affichees', () => {
        component.displayLimit = 2;
        expect(component.visibleTransactions.length).toBe(2);
        expect(component.hasMore).toBe(true);
    });

    it('doit augmenter la limite avec showMore', () => {
        component.displayLimit = 2;
        component.showMore();
        expect(component.displayLimit).toBe(12);
    });
});
