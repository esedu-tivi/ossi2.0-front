import React from 'react';
import { ListItem, ListItemButton, ListItemText } from '@mui/material';
import { StudentProject } from '.';

interface StudentProjectListItemProps {
  project: StudentProject;
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
