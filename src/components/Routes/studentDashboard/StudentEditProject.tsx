import { Box, Button, Dialog, DialogTitle, IconButton, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import React, { useEffect, useState } from "react";
import RichTextEditor from "../../common/RichTextEditor";
import { ProjectStatus, StudentProject } from ".";

interface StudentEditProjectProps {
  open: boolean;
  onClose: () => void;
  project: StudentProject|null;
  saveProject: (project: StudentProject) => void;
};

interface TimeTrackingListItemProps {
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}

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

const StudentEditProject: React.FC<StudentEditProjectProps> = ({ open, onClose, project, saveProject }) => {
  const [formData, setFormData] = useState({ plan: '', report: '', date: '', startTime: '', endTime: '', description: '' });
  const [daysUsed, setDaysUsed] = useState(0);

  useEffect(() => {
    if (project) {
      setFormData({...formData, plan: project?.plan, report: project?.report });

      let timeDifference = 0;
      if (project.deadline && project.startDate) {
        timeDifference = (project?.deadline?.valueOf() - project?.startDate?.valueOf()) - (project?.deadline?.valueOf() - new Date().valueOf());
      };
      setDaysUsed(Math.floor(timeDifference / 1000 / 60 / 60 / 24));
    };
  }, [open]);

  const handleChange = (content: string, field: 'plan' | 'report' | 'date' | 'startTime' | 'endTime' | 'description') => {
    setFormData({...formData, [field]: content});
  };

  const handleClose = () => {
    if (project) {
      saveProject({...project, plan: formData.plan, report: formData.report });
    };
    onClose();
    setFormData({ plan: '', report: '', date: '', startTime: '', endTime: '', description: '' });
  };

  const startProject = () => {
    const startDate = new Date();
    const deadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    if (project) {
      saveProject({...project, plan: formData.plan, report: formData.report, status: ProjectStatus.Active, startDate: startDate, deadline: deadline });
    };
    onClose();
    setFormData({ plan: '', report: '', date: '', startTime: '', endTime: '', description: '' });
  };

  const returnProject = () => {
    if (project) {
      saveProject({...project, plan: formData.plan, report: formData.report, status: ProjectStatus.Returned });
    };
    onClose();
    setFormData({ plan: '', report: '', date: '', startTime: '', endTime: '', description: '' });
  };

  const reactivateProject = () => {
    if (project) {
      saveProject({...project, plan: formData.plan, report: formData.report, status: ProjectStatus.Active });
    };
    onClose();
    setFormData({ plan: '', report: '', date: '', startTime: '', endTime: '', description: '' });
  }

  const addTimeTracking = () => {
    if (project) {
      const newTimeTracking = { date: formData.date, startTime: formData.startTime, endTime: formData.endTime, description: formData.description };
      if (project.timeTracking) {
        saveProject({ ...project, timeTracking: project.timeTracking.concat(newTimeTracking) });
      } else {
        saveProject({ ...project, timeTracking: [newTimeTracking] });
      }
      setFormData({ ...formData, date: '', startTime: '', endTime: '', description: '' });
    };
  };

  return (
    <Dialog open={open} onClose={() => handleClose()}>
      {project && <DialogTitle>{project.name}</DialogTitle>}
      {project?.status === ProjectStatus.Active &&
        <Box sx={{ p: 1 }}>
          <Typography>Projektiin käytetty aika: {daysUsed}/14 päivää</Typography>
          <LinearProgress variant="determinate" value={100 / 14 * daysUsed} />
        </Box>
      }
      <Box sx={{ p: 1 }}>
        <RichTextEditor
          height={210}
          label="Suunnitelma"
          value={formData.plan}
          onChange={(content) => handleChange(content, 'plan')}
        />
        <RichTextEditor
          height={210}
          label="Raportti"
          value={formData.report}
          onChange={(content) => handleChange(content, 'report')}
        />
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
        <Box sx={{ mt: 2 }}>
          {project?.status === ProjectStatus.Inactive && <Button variant="contained" onClick={() => startProject()}>Aloita projekti</Button>}
          {project?.status === ProjectStatus.Active && <Button variant="contained" onClick={() => returnProject()}>Palauta projekti</Button>}
          {project?.status === ProjectStatus.Returned && <Button variant="contained" onClick={() => reactivateProject()}>Peruuta palautus</Button>}
        </Box>
      </Box>
    </Dialog>
  );
};

export default StudentEditProject;
