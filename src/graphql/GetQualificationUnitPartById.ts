import { gql } from '@apollo/client';

export const GET_QUALIFICATION_UNIT_PART_BY_ID = gql`
  query GetQualificationUnitPartById($partId: ID!) {
    part(id: $partId) {
      name
      id
    }
  }
`