import { gql } from "@apollo/client";

export const GET_WORKPLACES = gql`
  query Workplaces {
  workplaces {
    status
    success
    workplaces {
      name
      id
      jobSupervisors {
        email
        firstName
        id
        lastName
      }
    }
  }
}
`
