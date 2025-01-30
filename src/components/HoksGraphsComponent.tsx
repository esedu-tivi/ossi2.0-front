import React from 'react';
import { Box } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { Subtopic } from '../data/StudiesData';

interface HoksGraphsProps {
  subtopics: Subtopic[];
  selectedSubtopic: Subtopic | null;
}

const HoksGraphsComponent: React.FC<HoksGraphsProps> = ({
  subtopics,
  selectedSubtopic,
}) => {
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
  const rightChartColors = selectedSubtopic
    ? selectedSubtopic.tasks.map((t) => (t.done ? '#94FF7C' : '#dfe6e9'))
    : [];

  return (
    <Box display="flex" justifyContent="space-between" padding={4}>
      {/* LEFT side: subtopics */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        style={{ maxWidth: '800px' }}
      >
        <Box
          style={{
            marginBottom: '10px',
            marginLeft: '320px',
            fontSize: '22px',
            
            fontFamily: 'Verdana, sans-serif',
          }}
        >
          Teemat
        </Box>

        <Box style={{ marginLeft: '250px' }}>
          <PieChart
            width={325}
            height={325}
            // Data array (one slice per subtopic)
            series={[
              {
                data: leftChartData,
                // The label text
                valueFormatter: (item) => String(item.id ?? ''),
              },
            ]}
            colors={leftChartColors}
          />
        </Box>
      </Box>

      {/* RIGHT side: tasks in selectedSubtopic */}
      {selectedSubtopic && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          style={{ maxWidth: '900px' }}
          marginRight="300px"
        >
          <Box
            style={{
              marginBottom: '10px',
              marginLeft: '155px',
              fontSize: '18px',
              width: '325px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontFamily: 'Verdana, sans-serif',
            }}
          >
            {selectedSubtopic.name}
          </Box>
          <Box style={{ marginLeft: '150px', marginBottom: '20px' }}>
            <PieChart
              width={325}
              height={325}
              // One slice per task
              series={[
                {
                  data: rightChartData,
                  valueFormatter: (item) => String(item.id ?? ''),
                },
              ]}
              // Match color order to rightChartData
              colors={rightChartColors}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default HoksGraphsComponent;
