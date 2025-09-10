import React from 'react';
import { Box, List, Typography } from '@mui/material';
import formStyles from '../../../styles/formStyles';
import { StudentProject } from '.';
import StudentProjectListItem from './StudentProjectListItem';

interface StudentProjectListProps {
  title: string;
  projects: StudentProject[];
  openEditProject: (project: StudentProject) => void;
};

const StudentProjectList: React.FC<StudentProjectListProps> = ({ title, projects, openEditProject }) => {
  return (
    <Box sx={{ ...formStyles.formOuterBox, m: 1, minHeight: 240 }}>
      <Box sx={{...formStyles.formBannerBox}}>
        <Typography variant='h6' align='center' color='white'>{title}</Typography>
      </Box>
      <List sx={{ overflow:'auto', position: 'relative' }}>
        {projects.map((project) => <StudentProjectListItem key={project.parentProject.id} project={project.parentProject} openEditProject={() => openEditProject(project)} />)}
      </List>
    </Box>
  );
};

export default StudentProjectList;
