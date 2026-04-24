import { gql } from "@apollo/client";

export const GET_MY_INTERNSHIPS = gql`
  query MyInternships {
    myInternships {
      internships {
        id
        info
        startDate
        endDate
        teacher {
          id
          firstName
          lastName
        }
        qualificationUnit {
          id
          name
        }
        workplace {
          id
          name
          jobSupervisor {
            id
            firstName
            lastName
            email
            phoneNumber
          }
        }
      }
      status
      success
    }
  }
`;
