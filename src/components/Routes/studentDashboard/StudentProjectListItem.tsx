import React from 'react';
import { ListItem, ListItemButton, ListItemText } from '@mui/material';
import { BaseProject } from '.';

interface StudentProjectListItemProps {
  project: BaseProject;
  openEditProject: () => void;
};

const StudentProjectListItem: React.FC<StudentProjectListItemProps> = ({project, openEditProject}) => {
  return (
    <ListItem>
      <ListItemButton onClick={openEditProject}>
        <ListItemText primary={project.name} />
      </ListItemButton>
    </ListItem>
  );
};

export default StudentProjectListItem;
