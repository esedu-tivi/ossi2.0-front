export interface Item {
  id: string;
  name: string;
}

export interface BasePartFormData {
  name: string;
  description: string;
  materials: string;
  projects: Item[];
  osaamiset: Item[];
  qualificationUnit: Item[];
}

export interface CreatePartFormData extends BasePartFormData {}

export interface EditPartFormData extends BasePartFormData {
  notifyStudents?: boolean;
  notifyStudentsText?: string;
}

export interface BaseProjectFormData {
  name: string;
  description: string;
  materials: string;
  osaamiset: Item[];
  duration: number;
  tags: Item[];
  includedInParts: Item[];
  isActive: boolean;
}

export interface CreateProjectFormData extends BaseProjectFormData {}

export interface EditProjectFormData extends BaseProjectFormData {
  notifyStudents?: boolean;
  notifyStudentsText?: string;
}