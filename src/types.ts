export enum ProjectStatus {
  Unassigned = "UNASSIGNED",
  Working = "WORKING",
  Returned = "RETURNED",
  Accepted = "ACCEPTED",
  Rejected = "REJECTED"
};

export interface BaseProject {
  id: number;
  name: string;
  description: string;
  materials: string;
  duration: number;
};

export interface WorktimeEntry {
  id: number;
  startDate: string;
  endDate: string;
  description: string;
};

export interface StudentProject {
  parentProject: BaseProject;
  projectStatus: ProjectStatus;
  projectPlan: string;
  projectReport: string;
  startDate?: Date;
  deadline?: Date;
  worktimeEntries?: WorktimeEntry[];
};

export type Student = {
  id: number;
  firstName: string;
  lastName: string;
  groupId: string;
  studyingQualificationTitle: {
    name: string | null;
  };
  studyingQualification: {
    "name": string | null
  }
};

export interface Project {
  id: number;
  name: string;
  includedInQualificationUnitParts: { id: number; name: string }[];
}

export interface SortConfig {
  column: string | null;
  order: "asc" | "desc" | null;
}

export interface JobSupervisor {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface Workplace {
  id: number
  name: string
  jobSupervisors: JobSupervisor[]
}

export interface Part {
  id: number;
  name: string;
}

export interface QualificationUnit {
  id: number;
  name: string;
  parts: Part[];
}

export type QualificationUnitPart = {
  id: number;
  name: string;
  parentQualificationUnit: { name: string };
};

export interface CompetenceRequirement {
  id: string;
  description: string;
}

