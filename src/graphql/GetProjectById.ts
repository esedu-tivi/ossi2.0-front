import { gql } from '@apollo/client';

export const GET_PROJECT_BY_ID = gql`
  query GetProjectById($id: ID!) {
    project(id: $id) {
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
        name
      }
    }
  }
`;



