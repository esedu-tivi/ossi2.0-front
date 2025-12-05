import { gql } from "@apollo/client";

export const GET_JOB_SUPERVISORS = gql`
  query JobSupervisors {
    jobSupervisors {
      jobSupervisors {
        firstName
        lastName
        id
      }
      status
      success
    }
  }
`
