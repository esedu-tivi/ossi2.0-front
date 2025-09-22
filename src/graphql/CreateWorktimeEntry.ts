import { gql } from '@apollo/client';

export const CREATE_WORKTIME_ENTRY = gql`
  mutation CreateWorktimeEntry($studentId: ID!, $projectId: ID!, $entry: StudentWorktimeInput) {
    createWorktimeEntry(studentId: $studentId, projectId: $projectId, entry: $entry) {
      message
      status
      success
    }
  }
`;