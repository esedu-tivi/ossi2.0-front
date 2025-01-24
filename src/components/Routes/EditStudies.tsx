import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import StudiesData from '../../data/StudiesData';
import { Tabs, Tab, Box, Accordion, AccordionSummary, AccordionDetails, Typography, LinearProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Function to calculate the progress of tasks
const calculateProgress = (tasks) => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.done).length;
    return totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
};

// Function to handle info icon click
const handleInfoClick = (id) => {
    console.log('Info clicked for task with id:', id);
};

// Function to render tasks
const renderTasks = (tasks) =>
    tasks.map((task) => (
        <Accordion key={task.id} sx={{ backgroundColor: task.done ? '#94FF7C' : '#F5F5F5' }}>
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

// Function to render subtopics
const renderSubtopics = (subtopics) =>
    subtopics.map((subtopic) => {
        const progress = calculateProgress(subtopic.tasks);
        const totalTasks = subtopic.tasks.length;
        const completedTasks = subtopic.tasks.filter((task) => task.done).length;
        return (
            <Accordion key={subtopic.id} sx={{ backgroundColor: progress === 100 ? '#94FF7C' : '#F5F5F5' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ flexGrow: 1 }}>{subtopic.name}</Typography>
                    <Typography>
                        {`${completedTasks}/${totalTasks}`}
                        <InfoOutlinedIcon onClick={() => handleInfoClick(subtopic.id)} sx={{ cursor: 'pointer', marginLeft: 1 }} />
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

// Function to render studies
const renderStudies = (studies) =>
    studies.map((study) => {
        const progress = calculateProgress(study.subtopics.flatMap((subtopic) => subtopic.tasks));
        return (
            <Accordion key={study.id} sx={{ backgroundColor: progress === 100 ? '#94FF7C' : '#F5F5F5' }}>
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

// Main component to edit studies
const EditStudies: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const student = location.state?.student;

    // Function to handle tab change
    const handleTabChange = (event: React.SyntheticEvent, newIndex: number) => {
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
                        color: '#ffffff',
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
                    {renderStudies(StudiesData)}
                </Box>
            )}
            {tabIndex === 1 && (
                <Box>
                    <Typography>Content for the other page goes here.</Typography>
                </Box>
            )}
        </div>
    );
};

export default EditStudies;
