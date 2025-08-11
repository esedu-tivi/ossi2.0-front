import React, { useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, List, Typography } from '@mui/material';
import formStyles from '../../../styles/formStyles';
import { StudentProject } from '.';
import StudentProjectListItem from './StudentProjectListItem';

interface UnitPart {
  id: number;
  name: string;
  projects: StudentProject[];
};

interface StudentInactiveProjectListProps {
  title: string;
  unitParts: UnitPart[];
  openEditProject: (project: StudentProject) => void;
};

interface UnitPartAccordionProps {
  unitPart: UnitPart;
  expanded: number | false;
  handleChange: (id: number) => void;
  openEditProject: (project: StudentProject) => void;
};

const UnitPartAccordion: React.FC<UnitPartAccordionProps> = ({ unitPart, expanded, handleChange, openEditProject}) => {
  return (
    <Accordion expanded={expanded === unitPart.id} onChange={() => handleChange(unitPart.id)}>
        <AccordionSummary>
          <Typography>{unitPart.name}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List sx={{ overflow:'auto', position: 'relative' }}>
            {unitPart.projects.map((project) => <StudentProjectListItem key={project.id} project={project} openEditProject={() => openEditProject(project)} />)}
          </List>
        </AccordionDetails>
      </Accordion>
  );
};

const StudentInactiveProjectList: React.FC<StudentInactiveProjectListProps> = ({ title, unitParts, openEditProject }) => {
  const [expanded, setExpanded] = useState<number | false>(false);

  const handleChange = (id: number) => {
    setExpanded(expanded === id ? false : id);
  }

  return (
    <Box sx={{ ...formStyles.formOuterBox, m: 1, minHeight: 240, flexGrow: 1 }}>
      <Box sx={{...formStyles.formBannerBox}}>
        <Typography variant='h6' align='center' color='white'>{title}</Typography>
      </Box>
      {unitParts.map((part) => <UnitPartAccordion key={part.id} unitPart={part} expanded={expanded} handleChange={handleChange} openEditProject={openEditProject} />)}
    </Box>
  );
};

export default StudentInactiveProjectList;
