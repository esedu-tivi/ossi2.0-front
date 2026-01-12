import { gql } from "@apollo/client";

export const EDIT_JOB_SUPERVISOR = gql`
  mutation Mutation($jobSupervisorId: ID!, $jobSupervisor: JobSupervisorInput!) {
    editJobSupervisor(id: $jobSupervisorId, jobSupervisor: $jobSupervisor) {
      status
      success
    }
  }
`
