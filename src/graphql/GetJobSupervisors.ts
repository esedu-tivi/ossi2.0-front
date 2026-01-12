import { gql } from "@apollo/client";

export const GET_JOB_SUPERVISORS = gql`
  query JobSupervisors {
    jobSupervisors {
      jobSupervisors {
        id
        firstName
        lastName
        email
        phoneNumber
        workplace {
          name
          id
        }
      }
      status
      success
    }
  }
`
