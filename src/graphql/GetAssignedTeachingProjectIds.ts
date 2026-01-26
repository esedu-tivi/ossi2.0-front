import { gql } from "@apollo/client";

export const GET_ASSIGNED_TEACHING_PROJECT_IDS = gql`
query AssignedTeachingProjects($teacherId: ID!) {
  assignedTeachingProjects(teacherId: $teacherId) {
    assignedProjects {
      id
    }
    status
    success
  }
}
`
