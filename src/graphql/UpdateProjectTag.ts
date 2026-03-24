import { gql } from '@apollo/client';

export const UPDATE_PROJECT_TAG = gql`
  mutation UpdateProjectTag($id: ID!, $color: String!) {
    updateProjectTag(id: $id, color: $color) {
      status
      success
      message
      tag {
        id
        name
        color
      }
    }
  }
`;
