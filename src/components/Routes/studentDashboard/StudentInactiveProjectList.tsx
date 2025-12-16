import React, { useState, useEffect } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, List, Typography } from '@mui/material';
import formStyles from '../../../styles/formStyles';
import { BaseProject, UnitPart } from '../../../types';
import StudentProjectListItem from './StudentProjectListItem';

interface StudentInactiveProjectListProps {
  title: string;
  unitParts: UnitPart[];
  projects: {
    projectId: number;
  }[];
  openEditProject: (project: BaseProject) => void;
};

interface UnitPartAccordionProps {
  unitPart: UnitPart;
  activeProjectIds: number[];
  expanded: number | false;
  handleChange: (id: number) => void;
  openEditProject: (project: BaseProject) => void;
};

const UnitPartAccordion: React.FC<UnitPartAccordionProps> = ({ unitPart, activeProjectIds, expanded, handleChange, openEditProject }) => {
  const [inactiveProjects, setInactiveProjects] = useState<BaseProject[]>([]);

  useEffect(() => {
    setInactiveProjects(unitPart.projects.filter((project) => !activeProjectIds.includes(project.id)));
  }, [activeProjectIds, unitPart]);

  return (
    <Accordion expanded={expanded === unitPart.id} onChange={() => handleChange(unitPart.id)}>
      <AccordionSummary>
        <Typography>{unitPart.name}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <List sx={{ overflow: 'auto', position: 'relative' }}>
          {inactiveProjects.map((project) => <StudentProjectListItem key={project.id} project={project} openEditProject={() => openEditProject(project)} />)}
        </List>
      </AccordionDetails>
    </Accordion>
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
    <Box sx={{ ...formStyles.formOuterBox, m: 1, minHeight: 240 }}>
      <Box sx={{ ...formStyles.formBannerBox }}>
        <Typography variant='h6' align='center' color='white'>{title}</Typography>
      </Box>
      {unitParts.map((part) => <UnitPartAccordion key={part.id} unitPart={part} activeProjectIds={activeProjectIds} expanded={expanded} handleChange={handleChange} openEditProject={handleOpenEditProject} />)}
    </Box>
  );
};

export default StudentInactiveProjectList;
