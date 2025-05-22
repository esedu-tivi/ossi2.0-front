import { gql } from '@apollo/client';

export const UPDATE_PART = gql`
  mutation Mutation($updatePartId: ID!, $part: CreatePartInput!) {
    updatePart(id: $updatePartId, part: $part) {
      message
      success
      status  
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
    }  
  }
`;