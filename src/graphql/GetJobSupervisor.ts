import { gql } from "@apollo/client";

export const GET_JOB_SUPERVISOR = gql`
  query JobSupervisor($jobSupervisorId: ID!) {
    jobSupervisor(jobSupervisorId: $jobSupervisorId) {
      status
      success
      jobSupervisor {
        id
        firstName
        lastName
        email
        phoneNumber
        workplace {
          id
          name
        }
        internships {
          id
          startDate
          endDate
          info
          qualificationUnit {
            id
            name
          }
          student {
            id
            firstName
            lastName
            email
          }
          teacher {
            id
            firstName
            lastName
            email
          }
        }
      }
    }
  }
`
