import { gql } from '@apollo/client';

export const DELETE_WORKPLACE = gql`
  mutation DeleteWorkplace($deleteWorkplaceId: ID!) {
    deleteWorkplace(id: $deleteWorkplaceId) {
      status
      success
    }
  }
`
