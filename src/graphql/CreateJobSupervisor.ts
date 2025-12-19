import { gql } from '@apollo/client';

export const CREATE_JOB_SUPERVISOR = gql`
mutation CreateJobSupervisor($jobSupervisor: JobSupervisorInput!) {
  createJobSupervisor(jobSupervisor: $jobSupervisor) {
    createdJobSupervisor {
      id
      firstName
      email
      lastName
    }
    status
    success
  }
}
`
