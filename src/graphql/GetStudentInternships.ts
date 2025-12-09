import { gql } from "@apollo/client";

export const GET_STUDENT_INTERNSHIPS = gql`
  query Internships($studentId: ID!) {
    internships(studentId: $studentId) {
      internships {
        id
        info
        startDate
        endDate
        teacher {
          id
          firstName
          lastName
        }
        qualificationUnit {
          id
          name
        }
        workplace {
          id
          name
          jobSupervisor {
            id
            firstName
            lastName
          }
        }
      }
      status
      success
    }
  }
`