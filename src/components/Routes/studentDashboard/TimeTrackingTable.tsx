import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProjectStatus, StudentProject } from '../../../types';
import { CREATE_WORKTIME_ENTRY } from '../../../graphql/CreateWorktimeEntry';
import { DELETE_WORKTIME_ENTRY } from '../../../graphql/DeleteWorktimeEntry';
import { GET_STUDENT_PROJECTS } from '../../../graphql/GetStudentProjects';
import { GET_ASSIGNED_PROJECT } from '../../../graphql/GetAssignedProject';

interface TimeTrackingTableProps {
  project: StudentProject | null;
  studentId: number;
}

interface TimeTrackingListItemProps {
  id: number;
  startDate: Date;
  endDate: Date;
  description: string;
  status: ProjectStatus;
}

const TimeTrackingListItem: React.FC<TimeTrackingListItemProps> = ({ id, startDate, endDate, description, status }) => {
  const [deleteEntry] = useMutation(DELETE_WORKTIME_ENTRY, { refetchQueries: [GET_STUDENT_PROJECTS] });

  const timeDifference = endDate.valueOf() - startDate.valueOf();
  const minutes = Math.floor(timeDifference / 1000 / 60) % 60;
  const hours = Math.floor(timeDifference / 1000 / 60 / 60);

  return (
    <TableRow>
      <TableCell>{startDate.toLocaleDateString()}</TableCell>
      <TableCell>{startDate.toLocaleTimeString('fi-FI', { timeStyle: 'short' })}</TableCell>
      <TableCell>{endDate.toLocaleTimeString('fi-FI', { timeStyle: 'short' })}</TableCell>
      <TableCell>{minutes < 10 ? `${hours}.0${minutes}` : `${hours}.${minutes}`}</TableCell>
      <TableCell>{description}</TableCell>
      {status === ProjectStatus.Working && (
        <TableCell>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={async () => await deleteEntry({ variables: { id } })}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
};

const TimeTrackingTable: React.FC<TimeTrackingTableProps> = ({ project, studentId }) => {
  const [formData, setFormData] = useState({ date: '', startTime: '', endTime: '', description: '' });

  const [createWorktimeEntry] = useMutation(CREATE_WORKTIME_ENTRY, { refetchQueries: [GET_ASSIGNED_PROJECT], onCompleted: (data) => console.log(data) });

  const handleChange = (content: string, field: 'date' | 'startTime' | 'endTime' | 'description') => {
    setFormData({ ...formData, [field]: content });
  };

  const addTimeTracking = async () => {
    if (!project) {
      console.log('project is undefined');
      return;
    }

    if (formData.startTime > formData.endTime) {
      console.log('start time must be before end time');
      return;
    }

    if (formData.date === '' || formData.startTime === '' || formData.endTime === '' || formData.description === '') {
      console.log('all fields must be filled');
      return;
    }

    const newTimeTracking = { startDate: new Date(`${formData.date}T${formData.startTime}`), endDate: new Date(`${formData.date}T${formData.endTime}`), description: formData.description };
    await createWorktimeEntry({ variables: { studentId, projectId: project.parentProject.id, entry: newTimeTracking } });

    setFormData({ date: '', startTime: '', endTime: '', description: '' });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pvm</TableHead>
            <TableHead>Aloitus klo</TableHead>
            <TableHead>Lopetus klo</TableHead>
            <TableHead>Kesto</TableHead>
            <TableHead>Kuvaus</TableHead>
            {project?.projectStatus === ProjectStatus.Working && <TableHead></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {project?.projectStatus === ProjectStatus.Working && (
            <TableRow>
              <TableCell>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(event) => handleChange(event.target.value, 'date')}
                  className="h-8 w-32"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(event) => handleChange(event.target.value, 'startTime')}
                  className="h-8 w-28"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(event) => handleChange(event.target.value, 'endTime')}
                  className="h-8 w-28"
                />
              </TableCell>
              <TableCell>-</TableCell>
              <TableCell>
                <Input
                  value={formData.description}
                  onChange={(event) => handleChange(event.target.value, 'description')}
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={addTimeTracking}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          )}
          {project?.worktimeEntries && project?.worktimeEntries?.map((t) => (
            <TimeTrackingListItem
              key={t.id}
              id={t.id}
              startDate={new Date(t.startDate)}
              endDate={new Date(t.endDate)}
              description={t.description}
              status={project.projectStatus}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TimeTrackingTable;
