import { gql } from "@apollo/client";

export const GET_PROJECTS = gql`
  query Projects {
    projects {
      id
      name
      includedInQualificationUnitParts {
        id
        name
      }
    }
  }
`;
