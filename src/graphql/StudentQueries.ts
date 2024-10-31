import { gql } from '@apollo/client';

export const GET_STUDENTS = gql`
  query GetStudents {
    students {
      id
      firstName
      lastName
      groupId
      studyingQualification {
        name
      }
    }
  }
`;
