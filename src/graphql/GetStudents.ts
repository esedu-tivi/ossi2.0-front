import { gql } from '@apollo/client';

export const GET_STUDENTS = gql`
  query GetStudents {
    students {
      status
      success
      message
      students {
        id
        firstName
        lastName
        groupId
        studyingQualification {
          name
        }
        studyingQualificationTitle {
        name
        }
      }
    }
  }
`;
