export interface BaseProjectFormData {
  name: string;
  description: string;
  materials: string;
  osaamiset: string[];
  duration: number;
  tags: string[];
  includedInParts: string[];
  isActive: boolean;
}

export interface CreateProjectFormData extends BaseProjectFormData {}

export interface EditProjectFormData extends BaseProjectFormData {
  changeNotification?: boolean;
  changeNotificationText?: string;
}