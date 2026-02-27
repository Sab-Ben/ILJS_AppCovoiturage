import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { PointBalance, USER_LEVELS, UserLevelConfig } from '../../models/point-balance.model';
import * as PointActions from '../../store/point/point.actions';
import * as PointSelectors from '../../store/point/point.selectors';

@Component({
    selector: 'app-level-badge',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './level-badge.component.html',
    styleUrls: ['./level-badge.component.scss']
})
export class LevelBadgeComponent implements OnInit, OnDestroy {
    balance: PointBalance | null = null;
    currentLevelConfig: UserLevelConfig = USER_LEVELS[0];
    nextLevelConfig: UserLevelConfig | null = USER_LEVELS[1];
    allLevels = USER_LEVELS;

    private subscription = new Subscription();

    constructor(private store: Store) {}

    ngOnInit(): void {
        this.store.dispatch(PointActions.loadBalance());

        this.subscription.add(
            this.store.select(PointSelectors.selectBalance).subscribe(balance => {
                if (balance) {
                    this.balance = balance;
                    this.currentLevelConfig = USER_LEVELS.find(l => l.name === balance.level) ?? USER_LEVELS[0];
                    this.nextLevelConfig = balance.nextLevel
                        ? USER_LEVELS.find(l => l.name === balance.nextLevel) ?? null
                        : null;
                }
            })
        );
    }

    get progressPercent(): number {
        return this.balance?.levelProgressPercent ?? 0;
    }

    get pointsRemaining(): number {
        return this.balance?.pointsToNextLevel ?? 0;
    }

    isLevelReached(level: UserLevelConfig): boolean {
        if (!this.balance) return false;
        return this.balance.totalEarned >= level.threshold;
    }

    isCurrentLevel(level: UserLevelConfig): boolean {
        return this.currentLevelConfig.name === level.name;
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
