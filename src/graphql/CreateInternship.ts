import { gql } from '@apollo/client';

export const CREATE_INTERNSHIP = gql`
  mutation CreateInternship($internship: InternshipInput!) {
  createInternship(internship: $internship) {
    internship {
      startDate
      info
      id
      endDate
    }
    status
    success
  }
}
`;