import { gql } from "@apollo/client";

export const CREATE_PROJECT_TAGS = gql`
  mutation CreateProjectTags($names: [String!]!) {
    createProjectTags(names: $names) {
      status
      success
      message
      projectTags {
        id
        name
      }
    }
  }
`
