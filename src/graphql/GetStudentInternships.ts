import { gql } from "@apollo/client";

export const GET_STUDENT_INTERNSHIPS = gql`
  query Internships($studentId: ID!) {
    internships(studentId: $studentId) {
      internships {
        endDate
        id
        info
        startDate
        workplace {
          id
          name
        }
      }
      status
      success
    }
  }
`