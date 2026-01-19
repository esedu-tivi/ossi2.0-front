import { gql } from "@apollo/client";

export const UPDATE_TAG_ASSIGNS = gql`
  mutation UpdateTagAssigns($userId: ID!, $assignedTagIds: [ID!]!, $unassignedTagIds: [ID!]!) {
    updateTagAssigns(userId: $userId, assignedTagIds: $assignedTagIds, unassignedTagIds: $unassignedTagIds) {
      message
      status
      success
    }
  }
`
