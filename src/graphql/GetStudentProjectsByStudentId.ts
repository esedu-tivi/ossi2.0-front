import { gql } from '@apollo/client';

export const GET_STUDENT_PROJECTS_BY_STUDENT_ID = gql`
  query AssignedStudentProjects($studentId: ID!) {
    assignedStudentProjects(studentId: $studentId) {
      assignedProjects {
        projectId
        startDate
        deadlineDate
        parentProject {
          id
          name
          includedInQualificationUnitParts {
            id
            name
          }
        }
        projectPlan
        projectReport
        projectStatus
        worktimeEntries {
          id
          startDate
          endDate
          description
        }
        teacherComment
      }
      status
      success
    }
  }
`
