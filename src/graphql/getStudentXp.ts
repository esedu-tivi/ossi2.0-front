import { gql } from "@apollo/client";

export const GET_STUDENT_XP = gql`
  query TeacherStudentsForXp($teacherId: ID!) {
    assignedStudents(teacherId: $teacherId) {
      students {
        id

        xp

        totalWorktimeMinutes

        lastLoginAt

        worktimeLogs {
          durationMinutes
          recordedAt
        }
      }
    }
  }
`;
