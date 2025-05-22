import { gql } from '@apollo/client';

export const GET_COMPETENCE_REQUIREMENTS = gql`
  query Parts($partId: ID!) {
    part(id: $partId) {
      message
      status
      success
      part {
        description
        id
        materials
        name
        projects {
          id
          name
        }
        parentQualificationUnit {
          competenceRequirementGroups {
            id
            requirements {
              id
              description
            }
            title
          }
          id
          name
        }
      }
    }
  }
`