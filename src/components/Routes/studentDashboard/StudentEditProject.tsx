import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Typography } from "@mui/material";
import { useMutation, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import RichTextEditor from "../../common/RichTextEditor";
import { ProjectStatus } from "./types";
import TimeTrackingTable from "./TimeTrackingTable";
import { UPDATE_STUDENT_PROJECT } from "../../../graphql/UpdateStudentProject";
import { GET_STUDENT_PROJECTS } from "../../../graphql/GetStudentProjects";
import { UNASSIGN_STUDENT_PROJECT } from "../../../graphql/UnassignStudentProject";
import ProjectDescription from "./ProjectDescription";
import { GET_ASSIGNED_PROJECT } from "../../../graphql/GetAssignedProject";

interface StudentEditProjectProps {
  open: boolean;
  onClose: () => void;
  studentId: number;
  projectId: number|null;
  setProjectId: (id: number|null) => void;
};

const StudentEditProject: React.FC<StudentEditProjectProps> = ({ open, onClose, studentId, projectId, setProjectId }) => {
  const [formData, setFormData] = useState({ plan: '', report: '' });
  const [daysUsed, setDaysUsed] = useState(0);
  const [recentlySaved, setRecentlySaved] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const { data, loading } = useQuery(GET_ASSIGNED_PROJECT, { variables: { projectId }, skip: projectId === null });

  const [unassignProject] = useMutation(UNASSIGN_STUDENT_PROJECT, {refetchQueries: [GET_STUDENT_PROJECTS]});
  const [updateProject] = useMutation(UPDATE_STUDENT_PROJECT, {refetchQueries: [GET_ASSIGNED_PROJECT, GET_STUDENT_PROJECTS], onCompleted: () => {
    setRecentlySaved(true);
    setTimeout(() => setRecentlySaved(false), 5000);
  }});

  useEffect(() => {
    if (loading || !projectId || !data) {
      return;
    };

    setFormData({...formData, plan: data.me.user.assignedProjectSingle.project.projectPlan, report: data.me.user.assignedProjectSingle.project.projectReport });

    let timeDifference = 0;
    if (data.me.user.assignedProjectSingle.project.deadline && data.me.user.assignedProjectSingle.project.startDate) {
      timeDifference = (data.me.user.assignedProjectSingle.project.deadline?.valueOf() - data.me.user.assignedProjectSingle.project.startDate?.valueOf()) - (data.me.user.assignedProjectSingle.project.deadline?.valueOf() - new Date().valueOf());
    };
    setDaysUsed(Math.floor(timeDifference / 1000 / 60 / 60 / 24));
  }, [data]);

  if (loading || !projectId || !data) {
    return;
  }

  const handleChange = (content: string, field: 'plan' | 'report') => {
    setFormData({...formData, [field]: content});
  };

  const handleClose = async () => {
    if (!data.me.user.assignedProjectSingle.project) {
      console.log('project is undefined');
      return;
    };

    if (data.me.user.assignedProjectSingle.project.projectStatus === ProjectStatus.Working) {
      await saveProject();
    };
    
    onClose();
  };

  const cancelProject = async () => {
    if (!data.me.user.assignedProjectSingle.project) {
      console.log('project is undefined');
      return;
    };

    setProjectId(null);
    await unassignProject({ variables: { studentId, projectId: data.me.user.assignedProjectSingle.project.parentProject.id }});

    onClose();
  };

  const returnProject = async () => {
    await saveProject(ProjectStatus.Returned);

    onClose();
  };

  const reactivateProject = async () => {
    await saveProject(ProjectStatus.Working);
    
    onClose();
  };

  const saveProject = async (setStatus = data.me.user.assignedProjectSingle.project?.projectStatus) => {
    if (!data.me.user.assignedProjectSingle.project) {
      console.log('project is undefinded');
      return;
    };

    const projectUpdate = { projectPlan: formData.plan, projectReport: formData.report, projectStatus: setStatus };
    await updateProject({ variables: { studentId, projectId: data.me.user.assignedProjectSingle.project.parentProject.id, update: projectUpdate }});
  };

  return (
    <Dialog maxWidth="md" open={open} onClose={() => handleClose()}>
      <Box sx={{ px: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <DialogTitle sx={{ width: '60%' }}>{data.me.user.assignedProjectSingle.project.parentProject.name}</DialogTitle>
        <Button variant="contained" onClick={() => setDescriptionOpen(true)}>Projektin kuvaus</Button>
      </Box>
      {data.me.user.assignedProjectSingle.project.projectStatus === ProjectStatus.Working &&
        <Box sx={{ p: 1 }}>
          <Box sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography>Projektiin käytetty aika: {daysUsed}/{data.me.user.assignedProjectSingle.project.parentProject.duration} päivää</Typography>
            <Button variant="contained">Pyydä lisää aikaa</Button>
          </Box>
          <LinearProgress variant="determinate" value={100 / data.me.user.assignedProjectSingle.project.parentProject.duration * daysUsed} />
        </Box>
      }
      <Box sx={{ p: 1 }}>
        <RichTextEditor
          height={180}
          label="Suunnitelma"
          value={formData.plan}
          onChange={(content) => handleChange(content, 'plan')}
        />
        <RichTextEditor
          height={180}
          label="Raportti"
          value={formData.report}
          onChange={(content) => handleChange(content, 'report')}
        />
        <TimeTrackingTable project={data.me.user.assignedProjectSingle.project} studentId={studentId} />
        <Box sx={{ mt: 2 }}>
          {data.me.user.assignedProjectSingle.project.projectStatus === ProjectStatus.Working && 
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                { recentlySaved && <Typography>Tallennettu</Typography>}
                <Button variant="contained" onClick={() => saveProject()}>Tallenna muutokset</Button>
                <Button variant="contained" onClick={() => returnProject()}>Palauta projekti</Button>
              </Box>
              <Button variant="contained" color="error" onClick={() => setConfirmCancelOpen(true)}>Peruuta projekti</Button>
            </Box>
          }
          {data.me.user.assignedProjectSingle.project.projectStatus === ProjectStatus.Returned && <Button variant="contained" onClick={() => reactivateProject()}>Peruuta palautus</Button>}
        </Box>
      </Box>
      <ProjectDescription project={data.me.user.assignedProjectSingle.project.parentProject} descriptionOpen={descriptionOpen} onClose={() => setDescriptionOpen(false)} />
      <Dialog open={confirmCancelOpen} onClose={() => setConfirmCancelOpen(false)}>
        <DialogTitle>Peruuta projekti</DialogTitle>
        <DialogContent>
          <Typography>Haluatko varmasti peruuttaa projektin?</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => {cancelProject(); setConfirmCancelOpen(false);}}>Kyllä</Button>
          <Button variant="contained" onClick={() => setConfirmCancelOpen(false)}>Ei</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default StudentEditProject;
