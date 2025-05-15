import { gql } from '@apollo/client';

export const USER_SETUP = gql`
  query UserSetup {
    amISetUp
    me {
      id
    }
  }
`;