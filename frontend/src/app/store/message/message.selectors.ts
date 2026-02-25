import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MessageState } from './message.reducer';

export const selectMessageState = createFeatureSelector<MessageState>('message');

export const selectConversations = createSelector(
  selectMessageState,
  (state) => state.conversations
);

export const selectActiveConversationId = createSelector(
  selectMessageState,
  (state) => state.activeConversationId
);

export const selectMessageLoading = createSelector(
  selectMessageState,
  (state) => state.loading
);

export const selectMessagesByConversation = createSelector(
  selectMessageState,
  (state) => state.messagesByConversation
);

export const selectMessagesForActiveConversation = createSelector(
  selectMessagesByConversation,
  selectActiveConversationId,
  (map, activeId) => {
    if (!activeId) return [];
    return map[activeId] ?? [];
  }
);
