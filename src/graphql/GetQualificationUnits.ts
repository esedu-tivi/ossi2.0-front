import { gql } from '@apollo/client';

export const GET_QUALIFICATION_UNITS = gql`
  query GetQualificationUnits {
    units {
      message
      status
      success
      units {
        id
        name
        parts {
          id
          name
        }
      }
    }
  }
`