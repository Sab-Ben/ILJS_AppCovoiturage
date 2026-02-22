import { createReducer, on } from '@ngrx/store';
import * as MessageActions from './message.actions';
import { Message } from '../../models/message.model';

export interface MessageState {
  activeConversationId: number | null;
  messagesByConversation: Record<number, Message[]>;
  loading: boolean;
  error: any;
}

export const initialState: MessageState = {
  activeConversationId: null,
  messagesByConversation: {},
  loading: false,
  error: null
};

function upsertMessage(list: Message[], incoming: Message): Message[] {
  const exists = list.some(m => m.id === incoming.id);
  if (exists) return list;
  return [...list, incoming].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
}

export const messageReducer = createReducer(
  initialState,

  on(MessageActions.setActiveConversation, (state, { conversationId }) => ({
    ...state,
    activeConversationId: conversationId
  })),

  on(MessageActions.loadMessages, MessageActions.sendMessage, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(MessageActions.loadMessagesSuccess, (state, { conversationId, messages }) => ({
    ...state,
    loading: false,
    messagesByConversation: {
      ...state.messagesByConversation,
      [conversationId]: messages
    }
  })),

  on(MessageActions.sendMessageSuccess, (state) => ({
    ...state,
    loading: false
  })),

  on(MessageActions.messageReceivedRealtime, (state, { message }) => {
    const current = state.messagesByConversation[message.conversationId] ?? [];
    return {
      ...state,
      messagesByConversation: {
        ...state.messagesByConversation,
        [message.conversationId]: upsertMessage(current, message)
      }
    };
  }),

  on(MessageActions.loadMessagesFailure, MessageActions.sendMessageFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(MessageActions.clearMessages, () => initialState)
);
