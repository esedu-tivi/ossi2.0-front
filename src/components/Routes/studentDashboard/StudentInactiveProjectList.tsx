import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseProject, UnitPart } from '../../../types';
import StudentProjectListItem from './StudentProjectListItem';

interface StudentInactiveProjectListProps {
  title: string;
  unitParts: UnitPart[];
  projects: {
    projectId: number;
  }[];
  openEditProject: (project: BaseProject) => void;
}

interface UnitPartAccordionProps {
  unitPart: UnitPart;
  activeProjectIds: number[];
  expanded: number | false;
  handleChange: (id: number) => void;
  openEditProject: (project: BaseProject) => void;
}

const UnitPartAccordion: React.FC<UnitPartAccordionProps> = ({ unitPart, activeProjectIds, expanded, handleChange, openEditProject }) => {
  const [inactiveProjects, setInactiveProjects] = useState<BaseProject[]>([]);

  useEffect(() => {
    setInactiveProjects(unitPart.projects.filter((project) => !activeProjectIds.includes(project.id)));
  }, [activeProjectIds, unitPart]);

  const isExpanded = expanded === unitPart.id;

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => handleChange(unitPart.id)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-accent"
      >
        <span>{unitPart.name}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      {isExpanded && (
        <div className="px-4 pb-3">
          <div className="flex flex-col gap-1">
            {inactiveProjects.map((project) => (
              <StudentProjectListItem
                key={project.id}
                project={project}
                openEditProject={() => openEditProject(project)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StudentInactiveProjectList: React.FC<StudentInactiveProjectListProps> = ({ title, unitParts, projects, openEditProject }) => {
  const [expanded, setExpanded] = useState<number | false>(false);
  const [activeProjectIds, setActiveProjectIds] = useState<number[]>([]);

  useEffect(() => {
    setActiveProjectIds(projects.map((p) => p.projectId));
  }, [projects]);

  const handleChange = (id: number) => {
    setExpanded(expanded === id ? false : id);
  };

  const handleOpenEditProject = (project: BaseProject) => {
    openEditProject(project);
  };

  return (
    <Card className="min-h-[240px]">
      <CardHeader className="bg-primary rounded-t-xl px-6 py-3">
        <CardTitle className="text-center text-primary-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {unitParts.map((part) => (
          <UnitPartAccordion
            key={part.id}
            unitPart={part}
            activeProjectIds={activeProjectIds}
            expanded={expanded}
            handleChange={handleChange}
            openEditProject={handleOpenEditProject}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default StudentInactiveProjectList;
