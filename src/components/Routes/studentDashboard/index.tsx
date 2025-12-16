import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Box, Typography } from '@mui/material';
import { BaseProject, StudentProject, ProjectStatus, QualificationUnit } from '../../../types';
import StudentProjectList from './StudentProjectList';
import StudentInactiveProjectList from './StudentInactiveProjectList';
import StudentEditProject from './StudentEditProject';
import { GET_STUDENT_PROJECTS } from '../../../graphql/GetStudentProjects';
import StudentAssignProject from './StudentAssignProject';

const StudentDashboard: React.FC = () => {
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedEditProject, setSelectedEditProject] = useState<number | null>(null);
  const [selectedAssignProject, setSelectedAssignProject] = useState<BaseProject | null>(null);

  const { loading, data, startPolling, stopPolling } = useQuery(GET_STUDENT_PROJECTS);

  if (loading || !data) {
    startPolling(500); // making sure data has loaded
    return (
      <Typography>loading</Typography>
    );
  };

  stopPolling();

  const assignedQualificationUnits = data.me.user.assignedQualificationUnits || []
  const assignedProjects = data.me.user.assignedProjects || []

  const handleOpenEditProject = (project: number) => {
    setEditOpen(true);
    setSelectedEditProject(project);
  };

  const handleCloseEditProject = () => {
    setEditOpen(false);
  };

  const handleOpenAssignProject = (project: BaseProject) => {
    setAssignOpen(true);
    setSelectedAssignProject(project);
  };

  const handleCloseAssignProject = () => {
    setAssignOpen(false);
  };

  return (
    <Box>
      <Typography variant='h4' align='center' p={2}>Mukavaa opiskelupäivää {data.me.user.firstName}</Typography>
      <Box sx={{ border: '1px lightgray solid', p: 1, m: 1, borderRadius: 1 }}>
        <Typography>Viestit</Typography>
        <Typography>tulee tähän joskus</Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
        <StudentInactiveProjectList title='Projektit' unitParts={assignedQualificationUnits.flatMap((u: QualificationUnit) => u.parts)} projects={assignedProjects} openEditProject={handleOpenAssignProject} />
        <Box>
          <StudentProjectList title='Työn alla' projects={assignedProjects.filter((p: StudentProject) => p.projectStatus === ProjectStatus.Working)} openEditProject={handleOpenEditProject} />
          <StudentProjectList title='Palautetut' projects={assignedProjects.filter((p: StudentProject) => p.projectStatus === ProjectStatus.Returned)} openEditProject={handleOpenEditProject} />
        </Box>
        <StudentProjectList title='Valmiit' projects={assignedProjects.filter((p: StudentProject) => p.projectStatus === ProjectStatus.Accepted)} openEditProject={handleOpenEditProject} />
      </Box>
      <StudentEditProject open={editOpen} onClose={handleCloseEditProject} studentId={data.me.user.id} projectId={selectedEditProject} setProjectId={setSelectedEditProject} />
      <StudentAssignProject open={assignOpen} onClose={handleCloseAssignProject} studentId={data.me.user.id} project={selectedAssignProject} />
    </Box>
  );
};

export default StudentDashboard;
