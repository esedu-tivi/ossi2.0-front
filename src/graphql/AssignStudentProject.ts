import { gql } from '@apollo/client';

export const ASSIGN_STUDENT_PROJECT = gql`
  mutation Mutation($studentId: ID!, $projectId: ID!) {
    assignProjectToStudent(studentId: $studentId, projectId: $projectId) {
      message
      status
      success
    }
  }
`