import { gql } from '@apollo/client';

export const GET_QUALIFICATION_UNIT_PARTS = gql`
  query GetQualificationUnitParts {
    parts {
      message
      status
      success
      parts {
        id
        name
        materials
        description
        parentQualificationUnit {
          id
          name
        }
        projects {
          id
          name
        }
      }
    }
  }
`