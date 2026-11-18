import React from 'react';
import { BaseProject } from '../../../types';

interface StudentProjectListItemProps {
  project: BaseProject;
  openEditProject: () => void;
}

const StudentProjectListItem: React.FC<StudentProjectListItemProps> = ({ project, openEditProject }) => {
  return (
    <button
      onClick={openEditProject}
      className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {project.name}
    </button>
  );
};

export default StudentProjectListItem;
