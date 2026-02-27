import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StudentProject } from '../../../types';
import StudentProjectListItem from './StudentProjectListItem';

interface StudentProjectListProps {
  title: string;
  projects: StudentProject[];
  openEditProject: (project: number) => void;
}

const StudentProjectList: React.FC<StudentProjectListProps> = ({ title, projects, openEditProject }) => {
  return (
    <Card className="min-h-[240px]">
      <CardHeader className="bg-primary rounded-t-xl px-6 py-3">
        <CardTitle className="text-center text-primary-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto">
        <div className="flex flex-col gap-1">
          {projects.map((project) => (
            <StudentProjectListItem
              key={project.parentProject.id}
              project={project.parentProject}
              openEditProject={() => openEditProject(project.parentProject.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentProjectList;
