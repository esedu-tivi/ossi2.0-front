import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  useEffect(() => {
    if (loading || !data) {
      startPolling(500);
      return () => {
        stopPolling();
      };
    }

    stopPolling();
    return () => {
      stopPolling();
    };
  }, [loading, data, startPolling, stopPolling]);

  if (loading || !data) {
    return (
      <p className="p-4 text-muted-foreground">loading</p>
    );
  }

  const assignedQualificationUnits = data.me.user.assignedQualificationUnits || [];
  const assignedProjects = data.me.user.assignedProjects || [];

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
    <div className="space-y-4 p-2">
      <h1 className="py-2 text-center text-2xl font-bold">
        Mukavaa opiskelupäivää {data.me.user.firstName}
      </h1>

      <Card>
        <CardHeader className="py-3">
          <CardTitle>Viestit</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">tulee tähän joskus</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StudentInactiveProjectList
          title="Projektit"
          unitParts={assignedQualificationUnits.flatMap((u: QualificationUnit) => u.parts)}
          projects={assignedProjects}
          openEditProject={handleOpenAssignProject}
        />
        <StudentProjectList
          title="Työn alla"
          projects={assignedProjects.filter((p: StudentProject) => p.projectStatus === ProjectStatus.Working)}
          openEditProject={handleOpenEditProject}
        />
        <StudentProjectList
          title="Palautetut"
          projects={assignedProjects.filter((p: StudentProject) => p.projectStatus === ProjectStatus.Returned)}
          openEditProject={handleOpenEditProject}
        />
        <StudentProjectList
          title="Valmiit"
          projects={assignedProjects.filter((p: StudentProject) => p.projectStatus === ProjectStatus.Accepted)}
          openEditProject={handleOpenEditProject}
        />
      </div>

      <StudentEditProject open={editOpen} onClose={handleCloseEditProject} studentId={data.me.user.id} projectId={selectedEditProject} setProjectId={setSelectedEditProject} />
      <StudentAssignProject open={assignOpen} onClose={handleCloseAssignProject} studentId={data.me.user.id} project={selectedAssignProject} />
    </div>
  );
};

export default StudentDashboard;
