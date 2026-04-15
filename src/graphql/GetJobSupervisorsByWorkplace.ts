import { gql } from "@apollo/client";

export const GET_JOB_SUPERVISORS_BY_WORKPLACE = gql`
  query JobSupervisorsByWorkplace($workplaceId: ID!) {
    jobSupervisorsByWorkplace(workplaceId: $workplaceId) {
      success
      status
      jobSupervisors {
        id
        firstName
        lastName
        email
        phoneNumber
      }
    }
  }
`
