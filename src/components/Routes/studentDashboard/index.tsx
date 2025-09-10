import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import StudentProjectList from './StudentProjectList';
import StudentInactiveProjectList from './StudentInactiveProjectList';
import StudentEditProject from './StudentEditProject';
import { useQuery } from '@apollo/client';
import { GET_STUDENT_PROJECTS } from '../../../graphql/GetStudentProjects';

export enum ProjectStatus {
  Inactive,
  Working = "WORKING",
  Returned = "RETURNED",
  Accepted = "ACCEPTED"
};

export interface BaseProject {
  id: number;
  name: string;
  description: string;
  duration: number;
};

export interface StudentProject {
  parentProject: BaseProject;
  projectStatus: ProjectStatus;
  projectPlan: string;
  projectReport: string;
  startDate?: Date;
  deadline?: Date;
  timeTracking?: {
    date: string;
    startTime: string;
    endTime: string;
    description: string;
  }[];
}

const StudentDashboard: React.FC = () => {
  const [editOpen, setEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<StudentProject|null>(null);

  const { loading, data, startPolling, stopPolling } = useQuery(GET_STUDENT_PROJECTS);

  if (loading || !data) {
    startPolling(500); // making sure data has loaded
    return (
      <Typography>loading</Typography>
    );
  };

  stopPolling();

  const handleOpenEditProject = (project: StudentProject) => {
    setEditOpen(true);
    setSelectedProject(project);
  };

  const handleCloseEditProject = () => {
    setEditOpen(false);
  };

  return (
    <div>
      <Typography variant='h4' align='center' p={2}>Mukavaa opiskelupäivää {data.me.user.firstName}</Typography>
      <Box sx={{ border: '1px lightgray solid', p: 1, m: 1, borderRadius: 1 }}>
        <Typography>Viestit</Typography>
        <Typography>tulee tähän joskus</Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
        <StudentInactiveProjectList title='Projektit' unitParts={data.me.user.assignedQualificationUnits[0].parts} projects={data.me.user.assignedProjects} openEditProject={handleOpenEditProject} />
        <Box>
          <StudentProjectList title='Työn alla' projects={data.me.user.assignedProjects.filter((p: StudentProject) => p.projectStatus === ProjectStatus.Working)} openEditProject={handleOpenEditProject} />
          <StudentProjectList title='Palautetut' projects={data.me.user.assignedProjects.filter((p: StudentProject) => p.projectStatus === ProjectStatus.Returned)} openEditProject={handleOpenEditProject} />
        </Box>
        <StudentProjectList title='Valmiit' projects={data.me.user.assignedProjects.filter((p: StudentProject) => p.projectStatus === ProjectStatus.Accepted)} openEditProject={handleOpenEditProject} />
      </Box>
      <StudentEditProject open={editOpen} onClose={handleCloseEditProject} studentId={data.me.user.id} project={selectedProject} />
    </div>
  );
};

export default StudentDashboard;
