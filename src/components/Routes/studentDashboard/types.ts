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
