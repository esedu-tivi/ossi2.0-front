import { gql } from '@apollo/client';

export const USER_SETUP = gql`
  query UserSetup {
    amISetUp {
      success
      status
      message
      amISetUp
    }
    me {
      message
      status
      success
      user {
        id
      }
    }
  }
`;