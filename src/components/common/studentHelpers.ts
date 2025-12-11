import { Student } from "../../types";


export interface SortConfig {
  key: keyof Student | null; // The data to sort from
  order: "asc" | "desc" | null; // The order of sorting: ascending, descending or none
}

// Filter the list of students by search query.
export function filterStudents(
  students: Student[], //The list of students to filter.
  searchQuery: string // The search term used to filter students.
): Student[] { // Returns the filtered list of students.
  const lowerQuery = searchQuery.toLowerCase();
  return students.filter((student) => {
    const name = `${student.firstName} ${student.lastName}`.toLowerCase();
    const group = student.groupId.toLowerCase();
    // Temp comment out since backend returns null
    // const qualification = student.studyingQualificationTitle.name.toLowerCase() || "";

    return (
      name.includes(lowerQuery) ||
      group.includes(lowerQuery)
      // qualification.includes(lowerQuery)
    );
  });
}

// Sorts the list of students based on the filtering.
export function sortStudents(
  students: Student[],
  sortConfig: SortConfig
): Student[] {
  if (!sortConfig.order || !sortConfig.key) return students;

  const { key, order } = sortConfig;
  return [...students].sort((a, b) => {
    const valueA = a[key] ? String(a[key]).toLowerCase() : "";
    const valueB = b[key] ? String(b[key]).toLowerCase() : "";

    if (valueA === valueB) return 0;

    if (order === "asc") {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
}
