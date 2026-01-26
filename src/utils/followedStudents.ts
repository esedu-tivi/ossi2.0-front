// followedStudents.ts

export interface FollowedStudent {
  id: string;
  firstName: string;
  lastName: string;
}

const STORAGE_KEY = 'followedStudents';

export function getFollowedStudents(): FollowedStudent[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function addFollowedStudent(student: FollowedStudent) {
  const current = getFollowedStudents();
  if (!current.find(s => s.id === student.id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, student]));
  }
}

export function removeFollowedStudent(studentId: string) {
  const current = getFollowedStudents();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(current.filter(s => s.id !== studentId))
  );
}