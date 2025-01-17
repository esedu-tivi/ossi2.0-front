import { gql } from '@apollo/client';

export const MESSAGE_RECEIVED = gql`
  subscription MessageReceived($conversationId: ID!) {
    messageReceived(conversationId: $conversationId) {
      id
      content
      sender {
        id
        firstName
        lastName
        email
      }
      createdAt
    }
  }
`;

export const CONVERSATION_UPDATED = gql`
  subscription ConversationUpdated($userId: ID!) {
    conversationUpdated(userId: $userId) {
      id
      participants {
        id
        firstName
        lastName
        email
      }
      lastMessage {
        content
        createdAt
      }
    }
  }
`;
