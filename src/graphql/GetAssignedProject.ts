import { gql } from "@apollo/client";

export const GET_ASSIGNED_PROJECT = gql`
  query AssignedProjectSingle($projectId: ID!) {
    me {
      user {
        ... on Student {
          assignedProjectSingle(projectId: $projectId) {
            message
            status
            success
            project(projectId: $projectId) {
              startDate
              deadlineDate
              projectPlan
              projectReport
              projectStatus
              teacherComment
              parentProject {
                id
                name
                duration
                description
                materials
              }
              worktimeEntries {
                id
                startDate
                endDate
                description
              }
            }
          }
        }
      }
    }
  }
`;
