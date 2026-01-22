import { gql } from "@apollo/client";

export const UPDATE_STUDENT_GROUP_ASSIGNS = gql`
  mutation UpdateStudentGroupAssigns($userId: ID!, $assignGroupIds: [ID!]!, $unassignGroupIds: [ID!]!) {
    updateStudentGroupAssigns(userId: $userId, assignGroupIds: $assignGroupIds, unassignGroupIds: $unassignGroupIds) {
      status
      success
      message
    }
  }
`
