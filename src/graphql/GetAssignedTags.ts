import { gql } from "@apollo/client";

export const GET_ASSIGNED_TAGS = gql`
  query AssignedTags($teacherId: ID!) {
    assignedTags(teacherId: $teacherId) {
      tags {
        name
        id
      }
      success
      status
    }
  }
`
