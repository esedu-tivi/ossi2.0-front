import { gql } from '@apollo/client';

export const SET_STUDENT_INFO = gql`
  mutation Mutation($studentId: ID!, $studentSetupInput: StudentSetupInput!) {
    setUpStudent(studentId: $studentId, studentSetupInput: $studentSetupInput) {
      message
      status
      success
    }
  }
`;