import { gql } from '@apollo/client';

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation Mutation($markNotificationAsReadId2: ID!) {
    markNotificationAsRead(id: $markNotificationAsReadId2) {
      message
      status
      success
    }
  }
`;
