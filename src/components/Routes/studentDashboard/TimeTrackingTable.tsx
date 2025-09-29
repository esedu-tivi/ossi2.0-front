import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TextField, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { ProjectStatus, StudentProject } from "./types";
import { CREATE_WORKTIME_ENTRY } from "../../../graphql/CreateWorktimeEntry";
import { DELETE_WORKTIME_ENTRY } from "../../../graphql/DeleteWorktimeEntry";
import { GET_STUDENT_PROJECTS } from "../../../graphql/GetStudentProjects";
import { GET_ASSIGNED_PROJECT } from "../../../graphql/GetAssignedProject";

interface TimeTrackingTableProps {
  project: StudentProject|null;
  studentId: number;
};

interface TimeTrackingListItemProps {
  id: number;
  startDate: Date;
  endDate: Date;
  description: string;
  status: ProjectStatus;
};

const TimeTrackingListItem: React.FC<TimeTrackingListItemProps> = ({id, startDate, endDate, description, status}) => {
  const [deleteEntry] = useMutation(DELETE_WORKTIME_ENTRY, { refetchQueries: [GET_STUDENT_PROJECTS]});

  const timeDifference = endDate.valueOf() - startDate.valueOf();
  const minutes = Math.floor(timeDifference / 1000 / 60) % 60;
  const hours = Math.floor(timeDifference / 1000 / 60 / 60);

  return (
    <TableRow>
      <TableCell>
        {startDate.toLocaleDateString()}
      </TableCell>
      <TableCell>
        {startDate.toLocaleTimeString("fi-FI", {timeStyle: "short"})}
      </TableCell>
      <TableCell>
        {endDate.toLocaleTimeString("fi-FI", {timeStyle: "short"})}
      </TableCell>
      <TableCell>
        {minutes < 10 ? `${hours}.0${minutes}` : `${hours}.${minutes}`}
      </TableCell>
      <TableCell>
        {description}
      </TableCell>
      {status === ProjectStatus.Working && 
        <TableCell>
          <IconButton onClick={async () => await deleteEntry({ variables: { id }})}>
            <DeleteIcon />
          </IconButton>
        </TableCell>
      }
    </TableRow>
  );
};

const TimeTrackingTable: React.FC<TimeTrackingTableProps> = ({ project, studentId }) => {
  const [formData, setFormData] = useState({ date: '', startTime: '', endTime: '', description: '' });

  const [createWorktimeEntry] = useMutation(CREATE_WORKTIME_ENTRY, { refetchQueries: [GET_ASSIGNED_PROJECT], onCompleted: (data) => console.log(data) });

  const handleChange = (content: string, field: 'date' | 'startTime' | 'endTime' | 'description') => {
    setFormData({...formData, [field]: content});
  };

  const addTimeTracking = async () => {
    if (!project) {
      console.log('project is undefined');
      return
    };

    if (formData.startTime > formData.endTime) {
      console.log('start time must be before end time');
      return
    };

    if (formData.date === '' || formData.startTime === '' || formData.endTime === '' || formData.description === '') {
      console.log('all fields must be filled');
      return
    };
    
    const newTimeTracking = { startDate: new Date(`${formData.date}T${formData.startTime}`), endDate: new Date(`${formData.date}T${formData.endTime}`), description: formData.description };
    await createWorktimeEntry({ variables: { studentId, projectId: project.parentProject.id, entry: newTimeTracking }});

    setFormData({ date: '', startTime: '', endTime: '', description: '' });
  };

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Pvm</TableCell>
            <TableCell>Aloitus klo</TableCell>
            <TableCell>Lopetus klo</TableCell>
            <TableCell>Kesto</TableCell>
            <TableCell>Kuvaus</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { project?.projectStatus === ProjectStatus.Working &&
            <TableRow>
              <TableCell>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(event) => handleChange(event.target.value, 'date')}
                  />
              </TableCell>
              <TableCell>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(event) => handleChange(event.target.value, 'startTime')}
                  />
              </TableCell>
              <TableCell>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(event) => handleChange(event.target.value, 'endTime')}
                  />
              </TableCell>
              <TableCell>
                -
              </TableCell>
              <TableCell sx={{ display: 'flex' }}>
                <TextField
                  size="small"
                  value={formData.description}
                  onChange={(event) => handleChange(event.target.value, 'description')}
                  />
              </TableCell>
              <TableCell>
                <IconButton onClick={addTimeTracking}>
                  <AddIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          }
          { project?.worktimeEntries && project?.worktimeEntries?.map((t) => <TimeTrackingListItem key={t.id} id={t.id} startDate={new Date(t.startDate)} endDate={new Date(t.endDate)} description={t.description} status={project.projectStatus} />)}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TimeTrackingTable;