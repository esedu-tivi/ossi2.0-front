import { gql } from "@apollo/client";

export const GET_STUDENT_PROJECTS = gql`
  query Query {
    me {
      user {
        ... on Student {
          firstName
          lastName
          qualificationCompletion
          assignedQualificationUnits {
            name
            parts {
              id
              name
              projects {
                id
                name
                description
                duration
              }
            }
          }
        }
      }
    }
  }
`
