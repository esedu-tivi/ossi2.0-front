import { gql } from "@apollo/client";

export const GET_JOB_SUPERVISOR = gql`
  query JobSupervisor($jobSupervisorId: ID!) {
  jobSupervisor(jobSupervisorId: $jobSupervisorId) {
    jobSupervisor {
      firstName
      email
      id
      lastName
      phoneNumber
      workplace {
        id
        name
      }
    }
    status
    success
  }
  }
`
