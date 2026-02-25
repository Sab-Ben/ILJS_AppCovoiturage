import { createReducer, on } from '@ngrx/store';
import * as MessageActions from './message.actions';
import { MessageModel } from '../../models/message.model';
import { ConversationModel } from '../../models/conversation.model';

export interface MessageState {
  conversations: ConversationModel[];
  activeConversationId: number | null;
  messagesByConversation: Record<number, MessageModel[]>;
  loading: boolean;
  error: any;
}

export const initialState: MessageState = {
  conversations: [],
  activeConversationId: null,
  messagesByConversation: {},
  loading: false,
  error: null
};

function upsertMessage(list: MessageModel[], incoming: MessageModel): MessageModel[] {
  const exists = list.some(m => m.id === incoming.id);
  if (exists) return list;
  return [...list, incoming].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export const messageReducer = createReducer(
  initialState,

  // Conversations
  on(MessageActions.loadConversations, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(MessageActions.loadConversationsSuccess, (state, { conversations }) => ({
    ...state,
    loading: false,
    conversations
  })),

  on(MessageActions.loadConversationsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Active conversation
  on(MessageActions.selectConversation, (state, { conversationId }) => ({
    ...state,
    activeConversationId: conversationId
  })),

  on(MessageActions.setActiveConversation, (state, { conversationId }) => ({
    ...state,
    activeConversationId: conversationId
  })),

  // Messages
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

  on(MessageActions.sendMessageSuccess, (state, { message }) => {
    const current = state.messagesByConversation[message.conversationId] ?? [];
    return {
      ...state,
      loading: false,
      messagesByConversation: {
        ...state.messagesByConversation,
        [message.conversationId]: upsertMessage(current, message)
      }
    };
  }),

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
