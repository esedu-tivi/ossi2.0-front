import { gql } from '@apollo/client';

export const CREATE_PART = gql`
  mutation Mutation($part: CreatePartInput!) {
    createPart(part: $part) {
      description
      id
      materials
      name
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
`