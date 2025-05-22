import { gql } from '@apollo/client';

export const UPDATE_PART_ORDER = gql`
  mutation Mutation($unitId: ID!, $partOrder: [ID!]!) {
    updatePartOrder(unitId: $unitId, partOrder: $partOrder) {
      message
      status
      success
    }
  }
`