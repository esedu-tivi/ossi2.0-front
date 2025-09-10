import { gql } from "@apollo/client";

export const GET_STUDENT_PROJECTS = gql`
  query Query {
    me {
      user {
        ... on Student {
          id
          firstName
          lastName
          qualificationCompletion
          assignedProjects {
            projectId
            projectPlan
            projectReport
            projectStatus
            startDate
            deadlineDate
            teacherComment
            parentProject {
              id
              name
              duration
              description
            }
          }
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
