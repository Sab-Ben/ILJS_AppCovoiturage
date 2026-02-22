import { describe, it, expect } from 'vitest';
import { messageReducer, initialState, MessageState } from './message.reducer';
import * as MessageActions from './message.actions';
import { Message } from '../../models/message.model';

describe('messageReducer', () => {
  it('should return initial state', () => {
    const state = messageReducer(undefined, { type: 'Unknown' } as any);
    expect(state).toEqual(initialState);
  });

  it('should set active conversation', () => {
    const state = messageReducer(
      initialState,
      MessageActions.setActiveConversation({ conversationId: 42 })
    );
    expect(state.activeConversationId).toBe(42);
  });

  it('should load messages success into the right conversation', () => {
    const messages: Message[] = [
      {
        id: 1,
        conversationId: 10,
        senderId: 2,
        senderEmail: 'a@test.com',
        content: 'Bonjour',
        sentAt: '2026-02-22T10:00:00'
      }
    ];

    const state = messageReducer(
      { ...initialState, loading: true },
      MessageActions.loadMessagesSuccess({ conversationId: 10, messages })
    );

    expect(state.loading).toBe(false);
    expect(state.messagesByConversation[10]).toEqual(messages);
  });

  it('should append realtime message and sort by sentAt', () => {
    const existing: Message = {
      id: 2,
      conversationId: 10,
      senderId: 2,
      senderEmail: 'a@test.com',
      content: 'Message 2',
      sentAt: '2026-02-22T10:05:00'
    };

    const incoming: Message = {
      id: 1,
      conversationId: 10,
      senderId: 3,
      senderEmail: 'b@test.com',
      content: 'Message 1',
      sentAt: '2026-02-22T10:00:00'
    };

    const base: MessageState = {
      ...initialState,
      messagesByConversation: { 10: [existing] }
    };

    const state = messageReducer(
      base,
      MessageActions.messageReceivedRealtime({ message: incoming })
    );

    expect(state.messagesByConversation[10]).toHaveLength(2);
    expect(state.messagesByConversation[10][0].id).toBe(1);
    expect(state.messagesByConversation[10][1].id).toBe(2);
  });

  it('should not duplicate realtime message', () => {
    const msg: Message = {
      id: 1,
      conversationId: 10,
      senderId: 2,
      senderEmail: 'a@test.com',
      content: 'Hello',
      sentAt: '2026-02-22T10:00:00'
    };

    const base: MessageState = {
      ...initialState,
      messagesByConversation: { 10: [msg] }
    };

    const state = messageReducer(
      base,
      MessageActions.messageReceivedRealtime({ message: msg })
    );

    expect(state.messagesByConversation[10]).toHaveLength(1);
  });

  it('should reset on clearMessages', () => {
    const dirty: MessageState = {
      activeConversationId: 10,
      messagesByConversation: {
        10: [{
          id: 1,
          conversationId: 10,
          senderId: 1,
          senderEmail: 'x@test.com',
          content: 'test',
          sentAt: '2026-02-22T10:00:00'
        }]
      },
      loading: true,
      error: { message: 'err' }
    };

    const state = messageReducer(dirty, MessageActions.clearMessages());
    expect(state).toEqual(initialState);
  });
});
