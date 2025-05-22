import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($idToken: String!) {
    login(idToken: $idToken) {
      message
      status
      success
      token
    }
  }
`;
