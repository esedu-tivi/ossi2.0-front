import { gql } from '@apollo/client';

export const DELETE_WORKTIME_ENTRY = gql`
  mutation DeleteWorktimeEntry($id: ID!) {
    deleteWorktimeEntry(id: $id) {
      message
      status
      success
    }
  }
`;