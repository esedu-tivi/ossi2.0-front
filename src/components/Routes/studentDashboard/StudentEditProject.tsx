import { Box, Button, Dialog, DialogContent, DialogTitle, LinearProgress, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import RichTextEditor from "../../common/RichTextEditor";
import { ProjectStatus, StudentProject } from ".";
import TimeTrackingTable from "./TimeTrackingTable";
import { useMutation } from "@apollo/client";
import { ASSIGN_STUDENT_PROJECT } from "../../../graphql/AssignStudentProject";
import { UPDATE_STUDENT_PROJECT } from "../../../graphql/UpdateStudentProject";
import { GET_STUDENT_PROJECTS } from "../../../graphql/GetStudentProjects";
import { UNASSIGN_STUDENT_PROJECT } from "../../../graphql/UnassignStudentProject";

interface StudentEditProjectProps {
  open: boolean;
  onClose: () => void;
  studentId: number;
  project: StudentProject|null;
};

const StudentEditProject: React.FC<StudentEditProjectProps> = ({ open, onClose, studentId, project }) => {
  const [formData, setFormData] = useState({ plan: '', report: '' });
  const [daysUsed, setDaysUsed] = useState(0);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [assignProject] = useMutation(ASSIGN_STUDENT_PROJECT, {refetchQueries: [GET_STUDENT_PROJECTS]});
  const [unassignProject] = useMutation(UNASSIGN_STUDENT_PROJECT, {refetchQueries: [GET_STUDENT_PROJECTS]});
  const [updateProject] = useMutation(UPDATE_STUDENT_PROJECT, {refetchQueries: [GET_STUDENT_PROJECTS]});

  useEffect(() => {
    if (!project) {
      console.log('project is undefined');
      return;
    };

    setFormData({...formData, plan: project?.projectPlan, report: project?.projectReport });

    let timeDifference = 0;
    if (project.deadline && project.startDate) {
      timeDifference = (project?.deadline?.valueOf() - project?.startDate?.valueOf()) - (project?.deadline?.valueOf() - new Date().valueOf());
    };
    setDaysUsed(Math.floor(timeDifference / 1000 / 60 / 60 / 24));
  }, [open]);

  const handleChange = (content: string, field: 'plan' | 'report') => {
    setFormData({...formData, [field]: content});
  };

  const handleClose = async () => {
    if (!project) {
      console.log('project is undefined');
      return;
    };

    saveProject();
    
    onClose();
    setFormData({ plan: '', report: '' });
  };

  const startProject = async () => {
    if (!project?.parentProject.duration) {
      console.log('duration is undefined');
      return
    };

    await assignProject({ variables: { studentId, projectId: project.parentProject.id }});

    onClose();
    setFormData({ plan: '', report: '' });
  };

  const cancelProject = async () => {
    if (!project) {
      console.log('project is undefined');
      return;
    };

    await unassignProject({ variables: { studentId, projectId: project.parentProject.id }});

    onClose();
    setFormData({ plan: '', report: '' });
  };

  const returnProject = async () => {
    await saveProject(ProjectStatus.Returned);

    onClose();
    setFormData({ plan: '', report: '' });
  };

  const reactivateProject = async () => {
    await saveProject(ProjectStatus.Working);
    
    onClose();
    setFormData({ plan: '', report: '' });
  };

  const saveProject = async (setStatus = project?.projectStatus) => {
    if (!project) {
      console.log('project is undefinded');
      return;
    };

    const projectUpdate = { projectPlan: formData.plan, projectReport: formData.report, projectStatus: setStatus };
    await updateProject({ variables: { studentId, projectId: project.parentProject.id, update: projectUpdate }});
  };

  return (
    <Dialog open={open} onClose={() => handleClose()}>
      <Box sx={{ px: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {project && <DialogTitle sx={{ width: '60%' }}>{project.parentProject.name}</DialogTitle>}
        <Button variant="contained" onClick={() => setDescriptionOpen(true)}>Projektin kuvaus</Button>
      </Box>
      {project?.projectStatus === ProjectStatus.Working &&
        <Box sx={{ p: 1 }}>
          <Box sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography>Projektiin käytetty aika: {daysUsed}/{project.parentProject.duration} päivää</Typography>
            <Button variant="contained">Pyydä lisää aikaa</Button>
          </Box>
          <LinearProgress variant="determinate" value={100 / project.parentProject.duration * daysUsed} />
        </Box>
      }
      <Box sx={{ p: 1 }}>
        <RichTextEditor
          height={200}
          label="Suunnitelma"
          value={formData.plan}
          onChange={(content) => handleChange(content, 'plan')}
        />
        <RichTextEditor
          height={200}
          label="Raportti"
          value={formData.report}
          onChange={(content) => handleChange(content, 'report')}
        />
        <TimeTrackingTable project={project} />
        <Box sx={{ mt: 2 }}>
          {!project?.projectStatus && <Button variant="contained" onClick={() => startProject()}>Aloita projekti</Button>}
          {project?.projectStatus === ProjectStatus.Working && 
            <>
              <Button variant="contained" onClick={() => returnProject()}>Palauta projekti</Button>
              <Button variant="contained" onClick={() => cancelProject()}>Peruuta projekti</Button>
              <Button variant="contained" onClick={() => saveProject()}>Tallenna muutokset</Button>
            </>
          }
          {project?.projectStatus === ProjectStatus.Returned && <Button variant="contained" onClick={() => reactivateProject()}>Peruuta palautus</Button>}
        </Box>
      </Box>
      <Dialog open={descriptionOpen} onClose={() => setDescriptionOpen(false)}>
        <DialogTitle>{project?.parentProject.name}</DialogTitle>
        <DialogContent>
          <Typography>{project?.parentProject.description}</Typography>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default StudentEditProject;
