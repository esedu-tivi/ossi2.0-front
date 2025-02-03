import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { Subtopic } from '../data/StudiesData';

interface HoksGraphsProps {
  subtopics: Subtopic[];
  selectedSubtopic: Subtopic | null;
}

const HoksGraphsComponent: React.FC<HoksGraphsProps> = ({ subtopics, selectedSubtopic }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  console.log('HoksGraphsComponent: subtopics = ', subtopics);
  console.log('HoksGraphsComponent: selectedSubtopic = ', selectedSubtopic);

  // --- LEFT CHART DATA & COLORS ---
  // 1) One slice per subtopic
  const leftChartData = subtopics.map((sub) => ({
    id: sub.name,
    value: sub.tasks.length,
  }));

  // For each subtopic, place its color
  const leftChartColors = subtopics.map((sub) => {
    // Hard-code yellow for TVP2 (Couldn't find a better way to do this)
    if (sub.id === 12) {
      return '#fffa65';
    }
    // Otherwise, check if all tasks are done => #94FF7C (green), else #dfe6e9 (grey)
    const allDone = sub.tasks.every((t) => t.done);
    return allDone ? '#94FF7C' : '#dfe6e9';
  });

  // --- RIGHT CHART DATA & COLORS ---
  // If we have a selected subtopic, each task = 1 slice
  const rightChartData = selectedSubtopic
    ? selectedSubtopic.tasks.map((task) => ({
        id: task.name,
        value: 1,
      }))
    : [];

  // For each task, green if done => #94FF7C, else grey => #dfe6e9
  const rightChartColors = selectedSubtopic ? selectedSubtopic.tasks.map((t) => (t.done ? '#94FF7C' : '#dfe6e9')) : [];

  return (
    <Box display="flex" flexDirection={isSmallScreen ? 'column' : 'row'} justifyContent="space-evenly" alignItems="center" padding={4}>
      {/* LEFT side: subtopics */}
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ maxWidth: '100%', marginBottom: isSmallScreen ? 4 : 0 }}>
        <Box
          sx={{
            marginBottom: 2,
            fontSize: '18px',
            fontFamily: 'Verdana, sans-serif',
            textAlign: 'center',
          }}
        >
          Teemat
        </Box>

        <Box display="flex" justifyContent="center" alignItems="center">
          <PieChart
            margin={{ right: 0 }}
            width={isSmallScreen ? 250 : 325}
            height={isSmallScreen ? 250 : 325}
            // Data array (one slice per subtopic)
            series={[
              {
                data: leftChartData,
                valueFormatter: (item) => String(item.id ?? ''),
              },
            ]}
            colors={leftChartColors}
          />
        </Box>
      </Box>

      {/* RIGHT side: tasks in selectedSubtopic */}
      {selectedSubtopic && (
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ maxWidth: '100%' }}>
          <Box
            sx={{
              marginBottom: 2,
              fontSize: '18px',
              width: '100%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontFamily: 'Verdana, sans-serif',
              textAlign: 'center',
            }}
          >
            {selectedSubtopic.name}
          </Box>
          <Box display="flex" justifyContent="center" alignItems="center">
            <PieChart
              margin={{ right: 0 }}
              width={isSmallScreen ? 250 : 325}
              height={isSmallScreen ? 250 : 325}
              series={[
                {
                  data: rightChartData,
                  valueFormatter: (item) => String(item.id ?? ''),
                },
              ]}
              colors={rightChartColors}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default HoksGraphsComponent;
