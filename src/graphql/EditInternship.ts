import { gql } from "@apollo/client";

export const EDIT_INTERNSHIP = gql`
  mutation Mutation($internshipId: ID!, $internship: InternshipInput!) {
    editInternship(internshipId: $internshipId, internship: $internship) {
      status
      success
      editedInternship {
        id
        startDate
        endDate
        info
        workplace {
          id
          name
          jobSupervisor {
            id
            firstName
            lastName
            email
          }
        }
        teacher {
          id
          firstName
          lastName
        }
        qualificationUnit {
          id
          name
        }
      }
    }
  }
`
