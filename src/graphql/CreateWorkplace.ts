import { gql } from '@apollo/client';

export const CREATE_WORKPLACE = gql`
  mutation CreateWorkplace($name: String!) {
  createWorkplace(name: $name) {
    status
    success
    workplace {
      id
      name
    }
  }
}
`
