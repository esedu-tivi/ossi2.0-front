export interface Item {
  id: string;
  name: string;
}

export interface BasePartFormData {
  name: string;
  description: string;
  materials: string;
  projectsInOrder: Item[];
  parentQualificationUnit: Item[];
}

export type CreatePartFormData = BasePartFormData;

export interface EditPartFormData extends BasePartFormData {
  notifyStudents?: boolean;
  notifyStudentsText?: string;
}

export interface BaseProjectFormData {
  name: string;
  description: string;
  materials: string;
  competenceRequirements: Item[];
  duration: number;
  tags: Item[];
  includedInQualificationUnitParts: Item[];
  isActive: boolean;
}

export type CreateProjectFormData = BaseProjectFormData;

export interface EditProjectFormData extends BaseProjectFormData {
  notifyStudents?: boolean;
  notifyStudentsText?: string;
}