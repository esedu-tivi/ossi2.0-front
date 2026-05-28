import { useQuery } from "@apollo/client";
import { GET_STUDENT_XP } from "./graphql/getStudentXp";
import { useState } from "react";

// THIS PROGRAM OUTPUTS STUDENTS XP, LAST LOGIN, STREAK AND STREAK DAYS, 
// PROGRAM DOESNT UPDATE ANY DATA YET

// NEEDS WHOLE MONTHS XP FOR "monthWork"
// NEEDS "STREAK" AND "STREAK DAYS"
// NÄYTÖSTÄ EI SAA XP:TÄ VIELÄ / WORK SHOWCASE DOESN'T GIVE XP YET

export function studentXPData(studentId: number) {

  // EXAMPLE DATA
  const [monthWork, setMonthWork] = useState([10, 10, 15, 5, 0]);
  let streakDays = 0;
  let weekStreak = 0;

  let startXP = 0;

  const [XPToday, setXPToday] = useState(0)

  // How much XP is multiplied with corresponding streak
  const streakMultiplier = {
    0: 1,
    1: 1.1,
    2: 1.15,
    3: 1.2,
    4: 1.25,
  };

  const XPReward = {
    logIn: 5,
    workLog: 5,
    naytto: 5,
  };

  const today = new Date().toISOString().split("T");

  // Student login and worklog data
  const { loading, error, data } = useQuery(GET_STUDENT_XP);

  if (loading) return <p>loading data</p>;
  if (error) return <p>Error</p>;

  // Assign student by input student id
  const student = data.assignedStudents.students.find(
    (student: any) => student.id === studentId,
  );

  // Check if student has done minimum work for streak and give xp
  // 1 log in and 1 work log
  if (student.lastLoginAt === today) {
    // give login XP
    setXPToday(XPToday + XPReward.logIn)

    if (student.worktimeLogs.at(-1).recordedAt === today) {
      streakDays += 1;
      // Give work log XP
      setXPToday(XPToday + XPReward.workLog)

      // Raise streak if possible
      if (streakDays >= 7) {
        streakDays = 0
        weekStreak += 1
      }
      return;
    }
    streakDays = 0;
    weekStreak = 0;
  }

  const totalXPToday = () => {
    let multiplierIndex = weekStreak
    if (weekStreak > 4) multiplierIndex = 4
    return XPToday * streakMultiplier.[multiplierIndex]
  } 

  // Delete first workdays XP and push todays earned xp 
  setMonthWork([...monthWork.slice(1), totalXPToday()])
  const monthXP = monthWork.forEach((dayXP) => (startXP += dayXP));

  return {
    student: {
      lastLogIn: student.lastLoginAt,
      xp: monthXP,
      streak: weekStreak,
      streakDays: streakDays,
    },
  };
}
