// notifiedStudents.ts

export function getNotifiedStudents(): string[] {
  const data = localStorage.getItem('notifiedStudents');
  return data ? JSON.parse(data) : [];
}

export function addNotifiedStudent(studentId: string) {
  const current = getNotifiedStudents();
  if (!current.includes(studentId)) {
    localStorage.setItem('notifiedStudents', JSON.stringify([...current, studentId]));
  }
}

export function removeNotifiedStudent(studentId: string) {
  const current = getNotifiedStudents();
  localStorage.setItem('notifiedStudents', JSON.stringify(current.filter(id => id !== studentId)));
}