import { gql } from '@apollo/client';

export const SEND_MESSAGE = gql`
  mutation SendMessage($conversationId: ID!, $content: String!) {
    sendMessage(conversationId: $conversationId, content: $content) {
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

export const CREATE_CONVERSATION = gql`
  mutation CreateConversation($participantIds: [ID!]!) {
    createConversation(participantIds: $participantIds) {
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
      createdAt
    }
  }
`;
