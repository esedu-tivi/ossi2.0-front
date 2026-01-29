import { gql } from "@apollo/client";

export const UPDATE_TEACHER_PROFILE = gql`
  mutation Mutation(
      $userId: ID!,
      $assignedTagIds: [ID!]!,
      $unassignedTagIds: [ID!]!,
      $assignGroupIds: [ID!]!,
      $unassignGroupIds: [ID!]!,
      $assignQualificationUnitIds: [ID!]!,
      $unassignQualificationUnitIds: [ID!]!
    ) {
    updateTagAssigns(userId: $userId, assignedTagIds: $assignedTagIds, unassignedTagIds: $unassignedTagIds) {
      success
      status
      message
    }
    updateStudentGroupAssigns(userId: $userId, assignGroupIds: $assignGroupIds, unassignGroupIds: $unassignGroupIds) {
      status
      success
      message
    }
    updateTeachingQualificationUnitAssigns(teacherId: $userId, assignQualificationUnitIds: $assignQualificationUnitIds, unassignQualificationUnitIds: $unassignQualificationUnitIds) {
    status
    success
    message
  }
  }
`
