import { gql } from "@apollo/client";

export const ASSIGN_TEACHING_PROJECT = gql`
  mutation AssignTeachingProject($teacherId: ID!, $projectId: ID!) {
    assignTeachingProject(userId: $teacherId, projectId: $projectId) {
      status
      success
      message
    }
  }
`
