import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Subtopic } from '../data/StudiesData';

interface HoksGraphsProps {
  subtopics: Subtopic[];
  selectedSubtopic: Subtopic | null;
}

const HoksGraphsComponent: React.FC<HoksGraphsProps> = ({ subtopics, selectedSubtopic }) => {
  console.log('HoksGraphsComponent: subtopics = ', subtopics);
  console.log('HoksGraphsComponent: selectedSubtopic = ', selectedSubtopic);

  // --- LEFT CHART DATA & COLORS ---
  const leftChartData = subtopics.map((sub) => ({
    name: sub.name,
    value: sub.tasks.length,
  }));

  const leftChartColors = subtopics.map((sub) => {
    // Hard-code yellow for TVP2
    if (sub.id === 12) {
      return '#fffa65';
    }
    const allDone = sub.tasks.every((t) => t.done);
    return allDone ? '#94FF7C' : '#dfe6e9';
  });

  // --- RIGHT CHART DATA & COLORS ---
  const rightChartData = selectedSubtopic
    ? selectedSubtopic.tasks.map((task) => ({
        name: task.name,
        value: 1,
      }))
    : [];

  const rightChartColors = selectedSubtopic
    ? selectedSubtopic.tasks.map((t) => (t.done ? '#94FF7C' : '#dfe6e9'))
    : [];

  return (
    <div className="flex flex-col items-center justify-evenly gap-8 p-4 md:flex-row">
      {/* LEFT side: subtopics */}
      <div className="flex w-full max-w-sm flex-col items-center">
        <p className="mb-2 text-center font-sans text-lg">Teemat</p>
        <ResponsiveContainer width="100%" height={325}>
          <PieChart>
            <Pie
              data={leftChartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={140}
            >
              {leftChartData.map((_entry, index) => (
                <Cell key={`cell-left-${index}`} fill={leftChartColors[index]} />
              ))}
            </Pie>
            <Tooltip formatter={(_value, name) => [name, '']} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* RIGHT side: tasks in selectedSubtopic */}
      {selectedSubtopic && (
        <div className="flex w-full max-w-sm flex-col items-center">
          <p className="mb-2 truncate text-center font-sans text-lg">
            {selectedSubtopic.name}
          </p>
          <ResponsiveContainer width="100%" height={325}>
            <PieChart>
              <Pie
                data={rightChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={140}
              >
                {rightChartData.map((_entry, index) => (
                  <Cell key={`cell-right-${index}`} fill={rightChartColors[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(_value, name) => [name, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default HoksGraphsComponent;
