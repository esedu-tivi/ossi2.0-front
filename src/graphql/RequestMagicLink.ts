import { gql } from '@apollo/client';

export const REQUEST_MAGIC_LINK = gql`
  mutation Mutation($email: String!) {
    requestMagicLink(email: $email) {
      ok
    }
  }
`;
