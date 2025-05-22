import { gql } from "@apollo/client";

export const GET_PROJECTS = gql`
  query Projects {
    projects {
      message
      status
      success
      projects {
        id
        name
        description
        duration
        includedInQualificationUnitParts {
          id
          name
        }
        materials
        isActive
        tags {
          name
        }
      }
    }
  }
`;

