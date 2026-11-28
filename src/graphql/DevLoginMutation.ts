import { gql } from '@apollo/client';

// Development only. The backend accepts this only when NODE_ENV=development and
// DEV_LOGIN_ENABLED=true; see src/components/DevLoginForm.tsx.
export const DEV_LOGIN_MUTATION = gql`
  mutation DevLogin($email: String!, $firstName: String, $lastName: String, $groupName: String) {
    devLogin(email: $email, firstName: $firstName, lastName: $lastName, groupName: $groupName) {
      message
      status
      success
      token
    }
  }
`;
