import { gql } from "@apollo/client";

export const GET_INTERNSHIP_DATA = gql`
  query GetInternshipData {
  me {
    user {
      firstName
      lastName
      id
    }
  },
  workplaces {
    workplaces {
      id
      name
    }
  }
  units {
    units {
      id
      name
    }
  }
}
`
