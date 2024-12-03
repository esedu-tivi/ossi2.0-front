import { gql } from '@apollo/client';

export const GET_PARTS = gql`
  query Parts {
    parts {
      name
      id
    }
  }
`;
