import { gql } from "@apollo/client";

export const UPDATE_STUDENT_PROJECT = gql`
  mutation UpdateStudentProject($studentId: ID!, $projectId: ID!, $update: UpdateStudentProjectInput!) {
    updateStudentProject(studentId: $studentId, projectId: $projectId, update: $update) {
      message
      status
      success
    }
  }
`;