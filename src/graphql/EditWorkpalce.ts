import { gql } from '@apollo/client';

export const EDIT_WORKPLACE = gql`
  mutation EditWorkplace($editWorkplaceId: ID!, $name: String!) {
  editWorkplace(id: $editWorkplaceId, name: $name) {
    editedWorkplace {
      id
      name
    }
    status
    success
  }
}
`;
