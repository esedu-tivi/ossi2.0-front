import { gql } from '@apollo/client';

export const GET_NOTIFICATIONS = gql`
  query {
    notifications {
      message
      status
      success
      notifications {
        ... on ProjectReturnNotification {
          id
          hasBeenRead
          time
          project {
            id
          }
        }
        ... on ProjectUpdateNotification {
          id
          hasBeenRead
          updateMessage
          time
          project {
            id
          }
        }
      }
    }
  }
`;
