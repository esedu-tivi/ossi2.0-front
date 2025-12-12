import { Project, SortConfig, Workplace } from "../../types";
import { Internship } from "../Routes/Internships";

// Filter the list of projects by search query. Checks project name 
//and the names of the included qualification unit parts.
export function filterProjects(projects: Project[], searchQuery: string): Project[] {
  const lowerQuery = searchQuery.toLowerCase();
  return projects.filter(
    (project) =>
      project.name.toLowerCase().includes(lowerQuery) ||
      project.includedInQualificationUnitParts.some((part) =>
        part.name.toLowerCase().includes(lowerQuery)
      )
  );
}


//Sort the list of projects based on the provided sort configuration.
//Supports sorting by 'id', 'name', or 'themes'. 
export function sortProjects(projects: Project[], sortConfig: SortConfig): Project[] {
  if (!sortConfig.column || !sortConfig.order) return projects;

  return [...projects].sort((a, b) => {
    let valueA: string | number;
    let valueB: string | number;

    switch (sortConfig.column) {
      case "name":
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case "id":
        valueA = a.id;
        valueB = b.id;
        break;
      case "themes":
        valueA = a.includedInQualificationUnitParts
          .map((part) => part.name.toLowerCase())
          .join(", ");
        valueB = b.includedInQualificationUnitParts
          .map((part) => part.name.toLowerCase())
          .join(", ");
        break;
      default:
        return 0; // No sorting applied if column doesn't match
    }

    if (valueA > valueB) return sortConfig.order === "asc" ? 1 : -1;
    if (valueA < valueB) return sortConfig.order === "asc" ? -1 : 1;
    return 0;
  });
}

export const filterWorkplaces = (workplaces: Workplace[], searchQuery: string): Workplace[] => {
  const lowerQuery = searchQuery.toLowerCase()
  return workplaces.filter(
    workplace =>
      workplace.name.toLowerCase().includes(lowerQuery)
  )
}

export const sortWorkplaces = (workplaces: Workplace[], sortConfig: SortConfig): Workplace[] => {
  if (!sortConfig.column || !sortConfig.order) return workplaces;

  return [...workplaces].sort((a, b) => {
    let valueA: string | number;
    let valueB: string | number;

    switch (sortConfig.column) {
      case "name":
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case "id":
        valueA = a.id;
        valueB = b.id;
        break;
      default:
        return 0;
    }
    if (valueA > valueB) return sortConfig.order === "asc" ? 1 : -1
    if (valueA < valueB) return sortConfig.order === "asc" ? -1 : 1
    return 0
  })
}

export const sortInternships = (internships: Internship[], sortConfig: SortConfig): Internship[] => {
  if (!sortConfig.column || !sortConfig.order) return internships;

  return [...internships].sort((a, b) => {
    let valueA: string | number | Date | null;
    let valueB: string | number | Date | null;

    switch (sortConfig.column) {
      case "startDate":
        valueA = a.startDate;
        valueB = b.startDate;
        break;
      case "endDate":
        valueA = a.endDate;
        valueB = b.endDate;
        break;
      case "info":
        valueA = a.info;
        valueB = b.info;
        break;
      case "id":
        valueA = a.id;
        valueB = b.id;
        break;
      default:
        return 0;
    }

    if (valueA === null || valueB === null) {
      return 0;
    }

    if (valueA > valueB) return sortConfig.order === "asc" ? 1 : -1
    if (valueA < valueB) return sortConfig.order === "asc" ? -1 : 1
    return 0
  })

}
