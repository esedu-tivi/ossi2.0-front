import { gql } from '@apollo/client';

export const DELETE_JOB_SUPERVISOR = gql`
  mutation DeleteJobSupervisor($jobSupervisorId: ID!) {
    deleteJobSupervisor(id: $jobSupervisorId) {
      status
      success
    }
  }
`