import { gql } from '@apollo/client';

// Everything the study plan (HOKS) view shows about one student.
export const STUDY_PLAN_FIELDS = gql`
  fragment StudyPlanFields on Student {
    id
    firstName
    lastName
    groupId
    qualificationCompletion
    studyingQualification {
      id
      name
      diaarinumero
      validFrom
      validUntil
      transitionEndsAt
    }
    studyingQualificationTitle {
      id
      name
      mandatoryUnits {
        id
        name
      }
    }
    assignedQualificationUnits {
      id
      name
      scope
      competenceRequirementGroups {
        id
        title
        requirements {
          id
          description
        }
      }
      parts {
        id
        name
        projects {
          id
          name
        }
      }
    }
    assignedProjects {
      projectId
      projectStatus
    }
  }
`;

// The logged-in student's own study plan.
export const GET_MY_STUDY_PLAN = gql`
  ${STUDY_PLAN_FIELDS}
  query MyStudyPlan {
    me {
      user {
        ...StudyPlanFields
      }
    }
  }
`;

// A student's study plan for a teacher, with what the teacher can choose from
// in the student's peruste (tutkintonimikkeet and units).
export const GET_STUDENT_STUDY_PLAN = gql`
  ${STUDY_PLAN_FIELDS}
  query StudentStudyPlan($studentId: ID!) {
    student(id: $studentId) {
      student {
        ...StudyPlanFields
        studyingQualification {
          id
          titles {
            id
            name
            mandatoryUnits {
              id
              name
            }
          }
          units {
            id
            name
            scope
            isMandatory
          }
        }
      }
    }
  }
`;

const UPDATE_RESULT = `
  success
  status
  message
`;

export const SET_STUDENT_QUALIFICATION_TITLE = gql`
  mutation SetStudentQualificationTitle($studentId: ID!, $qualificationTitleId: ID!) {
    setStudentQualificationTitle(studentId: $studentId, qualificationTitleId: $qualificationTitleId) {
      ${UPDATE_RESULT}
    }
  }
`;

export const ASSIGN_QUALIFICATION_UNIT_TO_STUDENT = gql`
  mutation AssignQualificationUnitToStudent($studentId: ID!, $qualificationUnitId: ID!) {
    assignQualificationUnitToStudent(studentId: $studentId, qualificationUnitId: $qualificationUnitId) {
      ${UPDATE_RESULT}
    }
  }
`;

export const UNASSIGN_QUALIFICATION_UNIT_FROM_STUDENT = gql`
  mutation UnassignQualificationUnitFromStudent($studentId: ID!, $qualificationUnitId: ID!) {
    unassignQualificationUnitFromStudent(studentId: $studentId, qualificationUnitId: $qualificationUnitId) {
      ${UPDATE_RESULT}
    }
  }
`;
