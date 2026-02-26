import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

import { NotificationBellComponent } from './notification-bell.component';
import * as NotificationActions from '../../store/notification/notification.actions';

describe('NotificationBellComponent', () => {
  let component: NotificationBellComponent;
  let fixture: ComponentFixture<NotificationBellComponent>;
  let store: Store;

  const storeMock = {
    dispatch: vi.fn(),
    select: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [NotificationBellComponent],
      providers: [
        { provide: Store, useValue: storeMock }
      ]
    }).compileComponents();

    store = TestBed.inject(Store);

    storeMock.select.mockReturnValue(of(0));

    fixture = TestBed.createComponent(NotificationBellComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should dispatch loadUnreadCount on init', () => {
    fixture.detectChanges();
    expect(storeMock.dispatch).toHaveBeenCalledWith(NotificationActions.loadUnreadCount());
  });

  it('should display the badge when unreadCount > 0', async () => {
    // 1. On configure le mock AVANT le detectChanges
    storeMock.select.mockReturnValue(of(5));

    fixture.detectChanges();

    await fixture.whenStable();
    fixture.detectChanges();

    const spans = fixture.debugElement.queryAll(By.css('span'));
    const badge = spans.find(s => s.nativeElement.textContent.includes('5'));

    expect(badge, 'Le badge devrait être présent dans le DOM').toBeTruthy();
    expect(badge?.nativeElement.textContent.trim()).toBe('5');
  });
  it('should hide the badge when unreadCount is 0', () => {
    storeMock.select.mockReturnValue(of(0));

    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('span[style*="background:red"]');

    if (badge) {
      expect(badge.style.display).toBe('none');
    }
  });

  it('should dispatch loadUnreadCount when refresh is called (click)', () => {
    fixture.detectChanges();
    storeMock.dispatch.mockClear();

    const bellContainer = fixture.debugElement.query(By.css('.notification-bell'));
    bellContainer.triggerEventHandler('click', null);

    expect(storeMock.dispatch).toHaveBeenCalledWith(NotificationActions.loadUnreadCount());
  });
});