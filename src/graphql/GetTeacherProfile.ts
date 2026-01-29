import { gql } from "@apollo/client";

export const GET_TEACHER_PROFILE = gql`
  query TeacherProfileAssigns($teacherId: ID!) {
    assignedTags(teacherId: $teacherId) {
      status
      success
      tags {
        name
        id
      }
    }
    assignedStudentGroups(teacherId: $teacherId) {
      status
      success
      studentGroups {
        groupId
      }
    }
    teachingQualificationUnits(teacherId: $teacherId) {
      status
      success
      qualificationUnits {
        id
        name
      }
    }
  }
`
