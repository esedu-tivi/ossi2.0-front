import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import formStyles from '../../../styles/formStyles';
import { StudentProject } from '.';

interface StudentProjectListItemProps {
  project: StudentProject;
  openEditProject: () => void;
};

interface StudentProjectListProps {
  title: string;
  projects: StudentProject[];
  openEditProject: (project: StudentProject) => void;
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

const StudentProjectList: React.FC<StudentProjectListProps> = ({ title, projects, openEditProject }) => {
  return (
    <Box sx={{ ...formStyles.formOuterBox, m: 1, minHeight: 240, flexGrow: 1 }}>
      <Box sx={{...formStyles.formBannerBox}}>
        <Typography variant='h6' align='center' color='white'>{title}</Typography>
      </Box>
      <List sx={{ overflow:'auto', position: 'relative' }}>
        {projects.map((project) => <StudentProjectListItem key={project.id} project={project} openEditProject={() => openEditProject(project)} />)}
      </List>
    </Box>
  );
};

export default StudentProjectList;
