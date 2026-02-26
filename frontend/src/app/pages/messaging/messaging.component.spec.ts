import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';

import { MessagingComponent } from './messaging.component';
import { WsService } from '../../services/ws.service';
import * as MessageActions from '../../store/message/message.actions';
import * as MessageSelectors from '../../store/message/message.selectors';

describe('MessagingComponent', () => {
  let component: MessagingComponent;
  let fixture: ComponentFixture<MessagingComponent>;
  let conversationsSubj: BehaviorSubject<any[]>;
  let activeIdSubj: BehaviorSubject<number | null>;

  const storeMock = {
    dispatch: vi.fn(),
    select: vi.fn((selector) => {
      if (selector === MessageSelectors.selectConversations) {
        return conversationsSubj.asObservable();
      }
      if (selector === MessageSelectors.selectActiveConversationId) {
        return activeIdSubj.asObservable();
      }
      return of([]);
    })
  };

  const wsServiceMock = {
    subscribeToConversation: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
    // Note : subscribeToUserNotifications est retiré car plus utilisé par le component
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    conversationsSubj = new BehaviorSubject<any[]>([]);
    activeIdSubj = new BehaviorSubject<number | null>(null);

    await TestBed.configureTestingModule({
      imports: [MessagingComponent, FormsModule],
      providers: [
        { provide: Store, useValue: storeMock },
        { provide: WsService, useValue: wsServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MessagingComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create and load conversations', () => {
    expect(component).toBeTruthy();
    expect(storeMock.dispatch).toHaveBeenCalledWith(MessageActions.loadConversations());
    // On ne vérifie plus wsService.subscribeToUserNotifications car c'est géré par les Effects/App
  });

  it('should react when activeConversationId changes in store', () => {
    storeMock.dispatch.mockClear();
    wsServiceMock.subscribeToConversation.mockClear();

    activeIdSubj.next(42);

    fixture.detectChanges();

    expect(storeMock.dispatch).toHaveBeenCalledWith(
        MessageActions.loadMessages({ conversationId: 42 })
    );

    expect(storeMock.dispatch).toHaveBeenCalledWith(
        MessageActions.markConversationAsRead({ conversationId: 42 })
    );

    // Mise à jour : on vérifie l'appel avec UN SEUL argument (l'ID)
    expect(wsServiceMock.subscribeToConversation).toHaveBeenCalledWith(42);
  });

  it('should dispatch sendMessage and clear input when send() is called', () => {
    component.selectedConversation = { id: 12 } as any;
    component.newMessage = 'Hello world';

    component.send();

    expect(storeMock.dispatch).toHaveBeenCalledWith(
        MessageActions.sendMessage({ conversationId: 12, content: 'Hello world' })
    );
    expect(component.newMessage).toBe('');
  });

  it('should unsubscribe from everything on destroy', () => {
    const unsubSpyConv = vi.fn();

    // On ne mock plus que la souscription de conversation
    (component as any).conversationWsSub = { unsubscribe: unsubSpyConv };

    const subSpy = vi.spyOn((component as any).sub, 'unsubscribe');

    // Act
    component.ngOnDestroy();

    // Assert
    expect(unsubSpyConv).toHaveBeenCalled();
    expect(subSpy).toHaveBeenCalled();
  });
});