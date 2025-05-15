import { gql } from '@apollo/client';

export const CREATE_PART = gql`
  mutation Mutation($part: CreatePartInput!) {
    createPart(part: $part) {
      part {
        id
        name
        description
        materials
        parentQualificationUnit {
          id
          name
        }
        projects {
          id
          name
        }
      }
      message
      status
      success
    }
  }
`;
