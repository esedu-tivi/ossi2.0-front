import { gql } from '@apollo/client';

export const UPDATE_JOB_SUPERVISOR_ASSIGNS = gql`
  mutation UpdateJobSupervisorAssigns($workplaceId: ID!, $assignIds: [ID!]!, $unassignIds: [ID!]!) {
  updateJobSupervisorAssigns(workplaceId: $workplaceId, assignIds: $assignIds, unassignIds: $unassignIds) {
    message
    status
    success
  }
}
`
