import { gql } from '@apollo/client';

export const GET_QUALIFICATION_UNITS = gql`
  query GetQualificationUnits {
    units {
      id
      name
    }
  }
`