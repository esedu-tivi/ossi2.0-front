import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import StudentProjectList from './StudentProjectList';
import StudentInactiveProjectList from './StudentInactiveProjectList';
import StudentEditProject from './StudentEditProject';
import { useQuery } from '@apollo/client';
import { GET_STUDENT_PROJECTS } from '../../../graphql/GetStudentProjects';

export enum ProjectStatus {
  Inactive,
  Active,
  Returned,
  Done
};

export interface StudentProject {
  id: number;
  name: string;
  description: string;
  duration: number;
  plan: string;
  report: string;
  status: ProjectStatus;
  startDate?: Date;
  deadline?: Date;
  timeTracking?: {
    date: string;
    startTime: string;
    endTime: string;
    description: string;
  }[];
};

/* const projects: StudentProject[] = [
  { id: 1, name: 'projekti 1', plan: '', report: '', status: ProjectStatus.Done },
  { id: 2, name: 'projekti 2', plan: '', report: '', status: ProjectStatus.Done },
  { id: 3, name: 'projekti 3', plan: '', report: '', status: ProjectStatus.Returned, timeTracking: [
    { date: '2025-04-22', startTime: '09:00', endTime: '15:00', description: 'did stuff' },
    { date: '2025-04-23', startTime: '10:00', endTime: '12:00', description: 'more stuff' }
  ]},
  { id: 4, name: 'projekti 4', plan: '', report: '', status: ProjectStatus.Active, startDate: new Date('2025-04-29'), deadline: new Date('2025-05-13'), timeTracking: [
    { date: '2025-04-24', startTime: '08:00', endTime: '14:00', description: 'did stuff' }
  ]},
  { id: 5, name: 'projekti 5', plan: '', report: '', status: ProjectStatus.Inactive },
  { id: 6, name: 'projekti 6', plan: '', report: '', status: ProjectStatus.Inactive },
  { id: 7, name: 'projekti 7', plan: '', report: '', status: ProjectStatus.Inactive },
  { id: 8, name: 'projekti 8', plan: '', report: '', status: ProjectStatus.Inactive },
  { id: 9, name: 'projekti 9', plan: '', report: '', status: ProjectStatus.Inactive },
  { id: 10, name: 'projekti 10', plan: '', report: '', status: ProjectStatus.Inactive },
  { id: 11, name: 'projekti 11', plan: '', report: '', status: ProjectStatus.Inactive },
  { id: 12, name: 'projekti 12', plan: '', report: '', status: ProjectStatus.Inactive }
]; */

const StudentDashboard: React.FC = () => {
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<StudentProject|null>(null);

  const { loading, data, startPolling, stopPolling } = useQuery(GET_STUDENT_PROJECTS);

  if (loading || !data) {
    startPolling(500);
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

  const handleSaveProject = (project: StudentProject) => {
    if (!project.status) {
      return
    };

    const index = projects.findIndex((p) => p.id === project.id);

    if (index >= 0) {
      const newProjects = projects;
      newProjects[index] = project;
      setProjects(newProjects);
    } else {
      setProjects([...projects, project]);
    };
  };

  return (
    <div>
      <Typography variant='h4' align='center' p={2}>Mukavaa opiskelupäivää {data.me.user.firstName}</Typography>
      <Box sx={{ border: '1px lightgray solid', p: 1, m: 1, borderRadius: 1 }}>
        <Typography>Viestit</Typography>
        <Typography>tulee tähän joskus</Typography>
      </Box>
      <Box sx={{ display: 'flex' }}>
        <StudentInactiveProjectList title='Projektit' unitParts={data.me.user.assignedQualificationUnits[0].parts} openEditProject={handleOpenEditProject} />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <StudentProjectList title='Työn alla' projects={projects.filter((p) => p.status === ProjectStatus.Active)} openEditProject={handleOpenEditProject} />
          <StudentProjectList title='Palautetut' projects={projects.filter((p) => p.status === ProjectStatus.Returned)} openEditProject={handleOpenEditProject} />
        </Box>
        <StudentProjectList title='Valmiit' projects={projects.filter((p) => p.status === ProjectStatus.Done)} openEditProject={handleOpenEditProject} />
      </Box>
      <StudentEditProject open={editOpen} onClose={handleCloseEditProject} project={selectedProject} saveProject={handleSaveProject} />
    </div>
  );
};

export default StudentDashboard;
