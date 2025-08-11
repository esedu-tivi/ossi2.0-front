import { Box, Button, Dialog, DialogContent, DialogTitle, LinearProgress, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import RichTextEditor from "../../common/RichTextEditor";
import { ProjectStatus, StudentProject } from ".";
import TimeTrackingTable from "./TimeTrackingTable";

interface StudentEditProjectProps {
  open: boolean;
  onClose: () => void;
  project: StudentProject|null;
  saveProject: (project: StudentProject) => void;
};

const StudentEditProject: React.FC<StudentEditProjectProps> = ({ open, onClose, project, saveProject }) => {
  const [formData, setFormData] = useState({ plan: '', report: '' });
  const [daysUsed, setDaysUsed] = useState(0);
  const [descriptionOpen, setDescriptionOpen] = useState(false);

  useEffect(() => {
    if (!project) {
      console.log('project is undefined');
      return;
    };

    setFormData({...formData, plan: project?.plan, report: project?.report });

    let timeDifference = 0;
    if (project.deadline && project.startDate) {
      timeDifference = (project?.deadline?.valueOf() - project?.startDate?.valueOf()) - (project?.deadline?.valueOf() - new Date().valueOf());
    };
    setDaysUsed(Math.floor(timeDifference / 1000 / 60 / 60 / 24));
  }, [open]);

  const handleChange = (content: string, field: 'plan' | 'report') => {
    setFormData({...formData, [field]: content});
  };

  const handleClose = () => {
    if (!project) {
      console.log('project is undefined');
      return;
    };

    saveProject({...project, plan: formData.plan, report: formData.report });
    onClose();
    setFormData({ plan: '', report: '' });
  };

  const startProject = () => {
    if (!project?.duration) {
      console.log('duration is undefined');
      return
    };

    const startDate = new Date();
    const deadline = new Date(Date.now() + project?.duration * 24 * 60 * 60 * 1000);

    saveProject({...project, plan: formData.plan, report: formData.report, status: ProjectStatus.Active, startDate: startDate, deadline: deadline, timeTracking: [] });

    onClose();
    setFormData({ plan: '', report: '' });
  };

  const returnProject = () => {
    if (!project) {
      console.log('project is undefined');
      return;
    };

    saveProject({...project, plan: formData.plan, report: formData.report, status: ProjectStatus.Returned });
    onClose();
    setFormData({ plan: '', report: '' });
  };

  const reactivateProject = () => {
    if (!project) {
      console.log('project is undefined');
      return;
    };

    saveProject({...project, plan: formData.plan, report: formData.report, status: ProjectStatus.Active });
    onClose();
    setFormData({ plan: '', report: '' });
  }

  return (
    <Dialog open={open} onClose={() => handleClose()}>
      <Box sx={{ px: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {project && <DialogTitle>{project.name}</DialogTitle>}
        <Button variant="contained" onClick={() => setDescriptionOpen(true)}>Projektin kuvaus</Button>
      </Box>
      {project?.status === ProjectStatus.Active &&
        <Box sx={{ p: 1 }}>
          <Box sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography>Projektiin käytetty aika: {daysUsed}/14 päivää</Typography>
            <Button variant="contained">Pyydä lisää aikaa</Button>
          </Box>
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
        <TimeTrackingTable project={project} saveProject={saveProject} />
        <Box sx={{ mt: 2 }}>
          {!project?.status && <Button variant="contained" onClick={() => startProject()}>Aloita projekti</Button>}
          {project?.status === ProjectStatus.Active && <Button variant="contained" onClick={() => returnProject()}>Palauta projekti</Button>}
          {project?.status === ProjectStatus.Returned && <Button variant="contained" onClick={() => reactivateProject()}>Peruuta palautus</Button>}
        </Box>
      </Box>
      <Dialog open={descriptionOpen} onClose={() => setDescriptionOpen(false)}>
        <DialogTitle>{project?.name}</DialogTitle>
        <DialogContent>
          <Typography>{project?.description}</Typography>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default StudentEditProject;
