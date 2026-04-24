import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AssignedProject, ProjectStatus, Student } from '../../types';
import EvaluateProject from './evaluateProject';
import { GET_STUDENT_PROJECTS_BY_STUDENT_ID } from '../../graphql/GetStudentProjectsByStudentId';
import { useParams } from 'react-router-dom';

const StudentProjectsPath = ({ student }: { student: Student }) => {
  const { studentId } = useParams();

  const { loading, data, startPolling, stopPolling } = useQuery(GET_STUDENT_PROJECTS_BY_STUDENT_ID, { variables: { studentId } });

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

  const assignedProjects: AssignedProject[] = data.assignedStudentProjects?.assignedProjects || [];
  console.log(assignedProjects);
  const startedProjects = assignedProjects.filter((p) => p.projectStatus === ProjectStatus.Working);
  const returnedProjects = assignedProjects.filter((p) => p.projectStatus === ProjectStatus.Returned);
  const acceptedProjects = assignedProjects.filter((p) => p.projectStatus === ProjectStatus.Accepted);

  return (
    <Card>
      <CardHeader className="bg-primary rounded-t-xl text-center">
        <CardTitle className="text-lg font-bold text-primary-foreground">
          {student.firstName} {student.lastName}:n Projektit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="mb-2 text-center text-lg font-semibold">Työn ala</h3>
          <div className="space-y-2">
            {startedProjects.map((project) => (
              <div key={project.projectId}>
                <EvaluateProject project={project} studentId={student.id} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-center text-lg font-semibold">Palautetut</h3>
          <div className="space-y-2">
            {returnedProjects.map((project) => (
              <div key={project.projectId}>
                <EvaluateProject project={project} studentId={student.id} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-center text-lg font-semibold">Valmiit</h3>
          <div className="space-y-2">
            {acceptedProjects.map((project) => (
              <div key={project.projectId}>
                <EvaluateProject project={project} studentId={student.id} />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentProjectsPath;
