import { gql } from '@apollo/client';

// Deletes themes and their links to projects; the projects are kept.
export const DELETE_PARTS = gql`
  mutation DeleteParts($ids: [ID!]!) {
    deleteParts(ids: $ids) {
      success
      status
      message
      deletedCount
    }
  }
`;
