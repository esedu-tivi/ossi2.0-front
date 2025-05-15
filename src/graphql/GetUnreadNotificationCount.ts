import { gql } from '@apollo/client';

export const GET_UNREAD_NOTIFICATION_COUNT = gql`
  query UnreadNotificationCount {
    unreadNotificationCount {
      message
      count
      status
      success
    }
  }
`;
