import { gql } from "@apollo/client";

export const GET_ASSIGNED_STUDENT_GROUPS = gql`
  query AssignedStudentGroups($teacherId: ID!) {
    assignedStudentGroups(teacherId: $teacherId) {
      status
      success
      studentGroups {
        groupId
      }
    }
  }
`
