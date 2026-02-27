import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { PointTransaction, PointTransactionType } from '../../models/point-transaction.model';
import * as PointActions from '../../store/point/point.actions';
import * as PointSelectors from '../../store/point/point.selectors';
import { UtcDatePipe } from '../../pipes/utc-date.pipe';

interface TransactionDisplay {
    icon: string;
    colorClass: string;
    label: string;
}

const TRANSACTION_CONFIG: Record<PointTransactionType, TransactionDisplay> = {
    BONUS_INSCRIPTION: { icon: '🎁', colorClass: 'points-history__amount--positive', label: 'Bonus' },
    GAIN_CONDUCTEUR: { icon: '🚗', colorClass: 'points-history__amount--positive', label: 'Gain' },
    DEPENSE_PASSAGER: { icon: '🎫', colorClass: 'points-history__amount--negative', label: 'Dépense' },
    REMBOURSEMENT_ANNULATION: { icon: '↩️', colorClass: 'points-history__amount--positive', label: 'Remboursement' },
    BONUS_NIVEAU: { icon: '🏆', colorClass: 'points-history__amount--positive', label: 'Bonus niveau' }
};

@Component({
    selector: 'app-points-history',
    standalone: true,
    imports: [CommonModule, UtcDatePipe],
    templateUrl: './points-history.component.html',
    styleUrls: ['./points-history.component.scss']
})
export class PointsHistoryComponent implements OnInit, OnDestroy {
    transactions: PointTransaction[] = [];
    loading = false;
    displayLimit = 10;

    private subscription = new Subscription();

    constructor(private store: Store) {}

    ngOnInit(): void {
        this.store.dispatch(PointActions.loadHistory());

        this.subscription.add(
            this.store.select(PointSelectors.selectTransactions).subscribe(txs => {
                this.transactions = txs;
            })
        );

        this.subscription.add(
            this.store.select(PointSelectors.selectHistoryLoading).subscribe(loading => {
                this.loading = loading;
            })
        );
    }

    getConfig(type: PointTransactionType): TransactionDisplay {
        return TRANSACTION_CONFIG[type];
    }

    formatAmount(amount: number): string {
        return amount > 0 ? `+${amount}` : `${amount}`;
    }

    showMore(): void {
        this.displayLimit += 10;
    }

    get hasMore(): boolean {
        return this.transactions.length > this.displayLimit;
    }

    get visibleTransactions(): PointTransaction[] {
        return this.transactions.slice(0, this.displayLimit);
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
