import { gql } from '@apollo/client';

export const GET_WORKPLACE = gql`
  query Workplace($workplaceId: ID!) {
    workplace(id: $workplaceId) {
      status
      success
      workplace {
        id
        name
        internships {
          id
          startDate
          endDate
          info
          jobSupervisor {
            id
            firstName
            lastName
            email
            phoneNumber
          }
          student {
            id
            firstName
            lastName
          }
          teacher {
            id
            firstName
            lastName
          }
        }
      }
    }
  }
`