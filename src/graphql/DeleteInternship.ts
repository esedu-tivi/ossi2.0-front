import { gql } from '@apollo/client';

export const DELETE_INTERNSHIP = gql`
  mutation DeleteInternship($internshipId: ID!) {
    deleteInternship(internshipId: $internshipId) {
      status
      success
    }
  }
`;
