import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TextField, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import React, { useState } from "react";
import { ProjectStatus, StudentProject } from ".";

interface TimeTrackingTableProps {
  project: StudentProject|null;
  saveProject: (project: StudentProject) => void;
};

interface TimeTrackingListItemProps {
  date: string;
  startTime: string;
  endTime: string;
  description: string;
};

const TimeTrackingListItem: React.FC<TimeTrackingListItemProps> = ({date, startTime, endTime, description}) => {
  const timeDifference = new Date(`${date}T${endTime}Z`).valueOf() - new Date(`${date}T${startTime}Z`).valueOf();
  const minutes = Math.floor(timeDifference / 1000 / 60) % 60;
  const hours = Math.floor(timeDifference / 1000 / 60 / 60);

  return (
    <TableRow>
      <TableCell>
        {date}
      </TableCell>
      <TableCell>
        {startTime}
      </TableCell>
      <TableCell>
        {endTime}
      </TableCell>
      <TableCell>
        {minutes < 10 ? `${hours}:0${minutes}` : `${hours}:${minutes}`}
      </TableCell>
      <TableCell>
        {description}
      </TableCell>
    </TableRow>
  );
};

const TimeTrackingTable: React.FC<TimeTrackingTableProps> = ({ project, saveProject }) => {
  const [formData, setFormData] = useState({ date: '', startTime: '', endTime: '', description: '' });

  const handleChange = (content: string, field: 'date' | 'startTime' | 'endTime' | 'description') => {
    setFormData({...formData, [field]: content});
  };

  const addTimeTracking = () => {
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

    const newTimeTracking = { date: formData.date, startTime: formData.startTime, endTime: formData.endTime, description: formData.description };
    if (project.timeTracking) {
      saveProject({ ...project, timeTracking: project.timeTracking.concat(newTimeTracking) });
    } else {
      saveProject({ ...project, timeTracking: [newTimeTracking] });
    }
    setFormData({ date: '', startTime: '', endTime: '', description: '' });
  };

  return (
    <TableContainer>
      <Table>
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
          { project?.timeTracking && project?.timeTracking?.map((t) => <TimeTrackingListItem key={t.date + t.startTime} date={t.date} startTime={t.startTime} endTime={t.endTime} description={t.description} />)}
          { project?.status === ProjectStatus.Active &&
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
                <IconButton onClick={addTimeTracking}>
                  <AddIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TimeTrackingTable;