import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, Tab, Box, Accordion, AccordionSummary, AccordionDetails, Typography, LinearProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import StudiesData, { Task, Subtopic, Study } from '../../data/StudiesData';
import HoksGraphsComponent from '../HoksGraphsComponent';

interface Student {
  firstName: string;
  lastName: string;
}

// Calculate progress
const calculateProgress = (tasks: Task[]) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.done).length;
  return totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
};

// Info click
const handleInfoClick = (id: number) => {
  console.log('Info clicked for task or subtopic with id:', id);
};

const EditStudies: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const student = location.state?.student as Student | undefined;

  // This subtopic state must match the same interface from StudiesData
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(null);
  const [expandedSubtopicId, setExpandedSubtopicId] = useState<number | null>(null);

  // Handle subtopic click
  const handleSubtopicClick = (subtopic: Subtopic) => {
    setSelectedSubtopic(subtopic);
    setExpandedSubtopicId((prevId) => (prevId === subtopic.id ? null : subtopic.id));
  };

  // Render tasks
  const renderTasks = (tasks: Task[]) => {
    return tasks.map((task) => (
      <Accordion key={task.id} sx={{ border: '1px solid #95a5a6', backgroundColor: task.done ? '#94FF7C' : '#F5F5F5' }}>
        <AccordionDetails>
          <Typography component="div" sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            {task.name}
            <Box sx={{ display: 'flex', alignItems: 'right' }}>
              {task.done && <CheckIcon />}
              <InfoOutlinedIcon onClick={() => handleInfoClick(task.id)} sx={{ cursor: 'pointer', marginLeft: 1 }} />
            </Box>
          </Typography>
        </AccordionDetails>
      </Accordion>
    ));
  };

  // Render subtopics
  const renderSubtopics = (subtopics: Subtopic[]) => {
    return subtopics.map((subtopic) => {
      const progress = calculateProgress(subtopic.tasks);
      const totalTasks = subtopic.tasks.length;
      const completedTasks = subtopic.tasks.filter((task) => task.done).length;

      return (
        <Accordion
          key={subtopic.id}
          disableGutters={true}
          expanded={expandedSubtopicId === subtopic.id}
          onChange={() => handleSubtopicClick(subtopic)}
          sx={{ border: '1px solid #95a5a6', backgroundColor: progress === 100 ? '#94FF7C' : '#F5F5F5' }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ flexGrow: 1 }}>{subtopic.name}</Typography>
            <Typography>
              {`${completedTasks}/${totalTasks}`}
              <InfoOutlinedIcon
                onClick={(e) => {
                  e.stopPropagation(); // Avoid toggling
                  handleInfoClick(subtopic.id);
                }}
                sx={{ cursor: 'pointer', marginLeft: 1 }}
              />
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ width: '100%' }}>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
            {renderTasks(subtopic.tasks)}
            {subtopic.subtopics && renderSubtopics(subtopic.subtopics)}
          </AccordionDetails>
        </Accordion>
      );
    });
  };

  // Render studies
  const renderStudies = (studies: Study[]) => {
    return studies.map((study) => {
      const progress = calculateProgress(study.subtopics.flatMap((subtopic) => subtopic.tasks));

      return (
        <Accordion key={study.id} disableGutters={true} sx={{ backgroundColor: progress === 100 ? '#94FF7C' : '#F5F5F5' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{study.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ width: '100%' }}>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
            {renderSubtopics(study.subtopics)}
          </AccordionDetails>
        </Accordion>
      );
    });
  };

  // Tab logic
  const handleTabChange = (_event: React.SyntheticEvent, newIndex: number) => {
    if (newIndex === 0) {
      navigate('/teacherdashboard/teacherstudies');
    } else if (newIndex === 1) {
      navigate('/teacherdashboard/educationpath');
    }
  };

  const tabIndex = location.pathname === '/teacherdashboard/teacherstudies' ? 0 : 1;

  return (
    <div>
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        aria-label="edit studies tabs"
        sx={{
          '& .MuiTab-root': {
            backgroundColor: '#eaddff',
            borderRadius: '10px 10px 0 0',
          },
          '& .Mui-selected': {
            backgroundColor: '#65558f',
            color: '#ffffff !important',
            borderRadius: '10px 10px 0 0',
          },
        }}
      >
        <Tab label="Opinnot" />
        <Tab label="HOKS" />
      </Tabs>

      {tabIndex === 0 && (
        <Box>
          <Typography variant="h6" sx={{ padding: 2 }}>
            Tutkinnon osat
          </Typography>
          {student && (
            <Typography variant="body1" sx={{ padding: 2 }}>
              Opiskelija: {student.firstName} {student.lastName}
            </Typography>
          )}

          {/* Provide fallback if subtopics is missing */}
          <HoksGraphsComponent subtopics={StudiesData[0]?.subtopics ?? []} selectedSubtopic={selectedSubtopic} />

          {renderStudies(StudiesData)}
        </Box>
      )}
    </div>
  );
};

export default EditStudies;
