import { gql } from "@apollo/client";

export const UNASSIGN_TEACHING_PROJECT = gql`
  mutation UnassignTeachingProject($teacherId: ID!, $projectId: ID!) {
    unassignTeachingProject(userId: $teacherId, projectId: $projectId) {
      message
      status
      success
    }
  }
`
