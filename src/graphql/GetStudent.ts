import { gql } from '@apollo/client'

export const GET_STUDENT = gql`
  query Student($studentId: ID!) {
    student(id: $studentId) {
      status
      student {
        id
        firstName
        lastName
        groupId
        studyingQualification {
          id
          name
        }
        studyingQualificationTitle {
          id
          name
        }
      }
      success
    }
  }
`
