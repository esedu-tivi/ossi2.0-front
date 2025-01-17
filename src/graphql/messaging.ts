import { gql } from '@apollo/client';

export const SEARCH_USERS = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      id
      firstName
      lastName
      email
      phoneNumber
      archived
    }
  }
`;

export const GET_CONVERSATIONS = gql`
  query GetConversations {
    conversations {
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

export const GET_MESSAGES = gql`
  query GetMessages($conversationId: ID!) {
    messages(conversationId: $conversationId) {
      id
      content
      sender {
        id
        firstName
        lastName
        email
      }
      readBy {
        id
        firstName
        lastName
      }
      createdAt
    }
  }
`;
