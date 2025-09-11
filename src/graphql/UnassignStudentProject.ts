import { gql } from '@apollo/client';

export const UNASSIGN_STUDENT_PROJECT = gql`
  mutation Mutation($studentId: ID!, $projectId: ID!) {
    unassignProjectFromStudent(studentId: $studentId, projectId: $projectId) {
      message
      status
      success
    }
  }
`