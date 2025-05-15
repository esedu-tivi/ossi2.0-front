import { gql } from '@apollo/client';

export const GET_NOTIFICATIONS = gql`
  query {
    notifications {
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
