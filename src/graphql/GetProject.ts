import { gql } from "@apollo/client";

export const GET_PROJECT = gql`
  query Query($projectId: ID!) {
    project(id: $projectId) {
      id
      name
      description
      duration
      materials
      isActive
      includedInQualificationUnitParts {
        id
        name
      }
      tags {
        id
        name
      }
    }
  }
`;