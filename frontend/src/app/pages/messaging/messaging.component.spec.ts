import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, Subject } from 'rxjs';
import { Store } from '@ngrx/store';

import { MessagingComponent } from './messaging.component';
import { ConversationService } from '../../services/conversation.service';
import { WsService } from '../../services/ws.service';
import { UserService } from '../../services/user.service';

import * as MessageActions from '../../store/message/message.actions';
import * as NotificationActions from '../../store/notification/notification.actions';

describe('MessagingComponent', () => {
  let component: MessagingComponent;
  let fixture: ComponentFixture<MessagingComponent>;

  const dispatchMock = vi.fn();

  const storeMock = {
    dispatch: dispatchMock,
    select: vi.fn(() => of([]))
  };

  const conversationServiceMock = {
    getMyConversations: vi.fn().mockReturnValue(of([]))
  };

  const wsServiceMock = {
    connect: vi.fn(),
    subscribeToConversation: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
    subscribeToUserNotifications: vi.fn().mockReturnValue({ unsubscribe: vi.fn() })
  };

  const userServiceMock = {
    getMyProfile: vi.fn().mockReturnValue(of({ id: 99 }))
  };

  const queryParamMap$ = new Subject<any>();

  beforeEach(async () => {
    dispatchMock.mockClear();

    await TestBed.configureTestingModule({
      imports: [MessagingComponent],
      providers: [
        provideRouter([]),
        { provide: Store, useValue: storeMock },
        { provide: ConversationService, useValue: conversationServiceMock },
        { provide: WsService, useValue: wsServiceMock },
        { provide: UserService, useValue: userServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParamMap$.asObservable(),
            snapshot: {
              queryParamMap: convertToParamMap({})
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MessagingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should connect websocket on init', () => {
    expect(wsServiceMock.connect).toHaveBeenCalled();
  });

  it('should subscribe to user notifications after loading profile', () => {
    expect(userServiceMock.getMyProfile).toHaveBeenCalled();
    expect(wsServiceMock.subscribeToUserNotifications).toHaveBeenCalledWith(99, expect.any(Function));
  });

  it('should load conversations on init', () => {
    expect(conversationServiceMock.getMyConversations).toHaveBeenCalled();
  });

  it('should select conversation and dispatch load actions', () => {
    const conversation = {
      id: 12,
      trajetId: 1,
      conducteurId: 2,
      conducteurEmail: 'c@test.com',
      passagerId: 3,
      passagerEmail: 'p@test.com',
      villeDepart: 'Paris',
      villeArrivee: 'Lyon',
      createdAt: '2026-02-22T10:00:00'
    };

    component.selectConversation(conversation);

    expect(dispatchMock).toHaveBeenCalledWith(
      MessageActions.setActiveConversation({ conversationId: 12 })
    );
    expect(dispatchMock).toHaveBeenCalledWith(
      MessageActions.loadMessages({ conversationId: 12 })
    );
    expect(wsServiceMock.subscribeToConversation).toHaveBeenCalledWith(12, expect.any(Function));
  });

  it('should dispatch sendMessage when message input is valid', () => {
    component.selectedConversation = {
      id: 12,
      trajetId: 1,
      conducteurId: 2,
      conducteurEmail: 'c@test.com',
      passagerId: 3,
      passagerEmail: 'p@test.com',
      villeDepart: 'Paris',
      villeArrivee: 'Lyon',
      createdAt: '2026-02-22T10:00:00'
    };
    component.messageInput = 'Bonjour';

    component.sendMessage();

    expect(dispatchMock).toHaveBeenCalledWith(
      MessageActions.sendMessage({ conversationId: 12, content: 'Bonjour' })
    );
    expect(component.messageInput).toBe('');
  });

  it('should not dispatch sendMessage when input is blank', () => {
    dispatchMock.mockClear();
    component.selectedConversation = {
      id: 12,
      trajetId: 1,
      conducteurId: 2,
      conducteurEmail: 'c@test.com',
      passagerId: 3,
      passagerEmail: 'p@test.com',
      villeDepart: 'Paris',
      villeArrivee: 'Lyon',
      createdAt: '2026-02-22T10:00:00'
    };
    component.messageInput = '   ';

    component.sendMessage();

    expect(dispatchMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: '[Message] Send Message' })
    );
  });

  it('isMine should return true only for current user', () => {
    component.currentUserId = 99;

    expect(component.isMine({ senderId: 99 } as any)).toBe(true);
    expect(component.isMine({ senderId: 12 } as any)).toBe(false);
  });

  it('should unsubscribe on destroy', () => {
    const unsubSpy1 = vi.fn();
    const unsubSpy2 = vi.fn();

    (component as any).conversationWsSub = { unsubscribe: unsubSpy1 };
    (component as any).notifWsSub = { unsubscribe: unsubSpy2 };

    component.ngOnDestroy();

    expect(unsubSpy1).toHaveBeenCalled();
    expect(unsubSpy2).toHaveBeenCalled();
  });
});
