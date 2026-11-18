import React, { useState } from 'react';
import { ChevronDown, Check, Info } from 'lucide-react';
import StudiesData, { Task, Subtopic, Study } from '../../data/StudiesData';
import { Student } from '../../types';

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

const EditStudies: React.FC<{ student: Student }> = ({ student }) => {
  const [expandedSubtopicId, setExpandedSubtopicId] = useState<number | null>(null);
  const [expandedStudyIds, setExpandedStudyIds] = useState<number[]>([]);

  const handleSubtopicClick = (subtopic: Subtopic) => {
    setExpandedSubtopicId((prevId) => (prevId === subtopic.id ? null : subtopic.id));
  };

  const toggleStudy = (studyId: number) => {
    setExpandedStudyIds((prev) =>
      prev.includes(studyId) ? prev.filter((id) => id !== studyId) : [...prev, studyId]
    );
  };

  // Render tasks
  const renderTasks = (tasks: Task[]) => {
    return tasks.map((task) => (
      <div
        key={task.id}
        className={`rounded border p-3 ${task.done ? 'bg-green-200' : 'bg-muted/30'}`}
      >
        <div className="flex w-full items-center justify-between">
          <span className="text-sm">{task.name}</span>
          <div className="flex items-center gap-1">
            {task.done && <Check className="h-4 w-4" />}
            <button onClick={() => handleInfoClick(task.id)} className="text-muted-foreground hover:text-foreground">
              <Info className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    ));
  };

  // Render subtopics
  const renderSubtopics = (subtopics: Subtopic[]) => {
    return subtopics.map((subtopic) => {
      const progress = calculateProgress(subtopic.tasks);
      const totalTasks = subtopic.tasks.length;
      const completedTasks = subtopic.tasks.filter((task) => task.done).length;
      const isExpanded = expandedSubtopicId === subtopic.id;

      return (
        <div
          key={subtopic.id}
          className={`rounded border ${progress === 100 ? 'bg-green-200' : 'bg-muted/30'}`}
        >
          <button
            onClick={() => handleSubtopicClick(subtopic)}
            className="flex w-full items-center justify-between p-3 text-left"
          >
            <span className="flex-1 text-sm">{subtopic.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm">{completedTasks}/{totalTasks}</span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleInfoClick(subtopic.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    handleInfoClick(subtopic.id);
                  }
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <Info className="h-4 w-4" />
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
          </button>
          {isExpanded && (
            <div className="space-y-2 px-3 pb-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {renderTasks(subtopic.tasks)}
              {subtopic.subtopics && renderSubtopics(subtopic.subtopics)}
            </div>
          )}
        </div>
      );
    });
  };

  // Render studies
  const renderStudies = (studies: Study[]) => {
    return studies.map((study) => {
      const progress = calculateProgress(study.subtopics.flatMap((subtopic) => subtopic.tasks));
      const isExpanded = expandedStudyIds.includes(study.id);

      return (
        <div
          key={study.id}
          className={`rounded border ${progress === 100 ? 'bg-green-200' : 'bg-muted/30'}`}
        >
          <button
            onClick={() => toggleStudy(study.id)}
            className="flex w-full items-center justify-between p-3 text-left"
          >
            <span className="text-sm">{study.name}</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
          {isExpanded && (
            <div className="space-y-2 px-3 pb-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {renderSubtopics(study.subtopics)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="p-2 text-lg font-semibold">Tutkinnon osat</h2>
      {student && (
        <p className="px-2 text-sm">
          Opiskelija: {student.firstName} {student.lastName}
        </p>
      )}

      <div className="space-y-2">
        {renderStudies(StudiesData)}
      </div>
    </div>
  );
};

export default EditStudies;
