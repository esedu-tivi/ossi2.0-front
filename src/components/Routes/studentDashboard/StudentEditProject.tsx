import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Typography } from "@mui/material";
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


interface StudentEditProjectProps {
  open: boolean;
  onClose: () => void;
  studentId: number;
  projectId: number|null;
  setProjectId: (id: number|null) => void;
};

const StudentEditProject: React.FC<StudentEditProjectProps> = ({ open, onClose, studentId, projectId, setProjectId }) => {
  const [formData, setFormData] = useState({ plan: '', report: '', message: '' });
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

  const styles = {
    dialog:{
      display:'flex',
      justifyContent:'center',
      width:'100%',
      height:'100%',
      margin:'0px',
      padding:'0px',
    },
    extrBtn:{
      
    }
  }

  useEffect(() => {
    if (loading || !projectId || !data) {
      return;
    };
    if(data.me.user.assignedProjectSingle.project.teacherComment===''){
      setFormData({...formData, plan: data.me.user.assignedProjectSingle.project.projectPlan, 
      report: data.me.user.assignedProjectSingle.project.projectReport,
       message: 'Feedback not provided' });
    }else{
      setFormData({...formData, plan: data.me.user.assignedProjectSingle.project.projectPlan, 
      report: data.me.user.assignedProjectSingle.project.projectReport,
       message: data.me.user.assignedProjectSingle.project.teacherComment });
    }

    console.log(formData)
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
    let newContent = content
    setFormData({...formData, [field]: newContent});
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
    if(String(formData.plan).includes('<p>') || String(formData.plan).includes('&nbsp;') ){
      formData.plan = formData.plan.replace(/<\/?p>/g, '').replace(/&nbsp;/g, '');
    }
    if(String(formData.report).includes('<p>') || String(formData.report).includes('&nbsp;') ){
      formData.report = formData.report.replace(/<\/?p>/g, '').replace(/&nbsp;/g, '');
    }
    const projectUpdate = { projectPlan: formData.plan, projectReport: formData.report, projectStatus: setStatus };
    await updateProject({ variables: { studentId, projectId: data.me.user.assignedProjectSingle.project.parentProject.id, update: projectUpdate }});
  };

  return (
    <Dialog scroll="paper" fullWidth={true} maxWidth={false} style={styles.dialog} open={open} onClose={() => handleClose()}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width:'auto'}}>
        <DialogTitle sx={{ width: '60%' }}>{data.me.user.assignedProjectSingle.project.parentProject.name}</DialogTitle>
        <Accordion sx={{width:'20%', margin:0}} disableGutters={true}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography onClick={() => setDescriptionOpen(true)}>Projektin kuvaus</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography color="error" onClick={() => setConfirmCancelOpen(true)}>Peruuta projekti</Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
      <Box sx={{ p: 1, }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
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
        </Box>
        
        <Box>
          <Typography variant="h6" sx={{ px: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color:"rgba(0, 0, 0, 0.6)" }}>Feedback</Typography>
          <Typography sx={{ px: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>{formData.message}</Typography>
        </Box>
        <TimeTrackingTable project={data.me.user.assignedProjectSingle.project} studentId={studentId} />
        {data.me.user.assignedProjectSingle.project.projectStatus === ProjectStatus.Working &&
        <Box sx={{ p: 1 }}>
          <Box sx={{ pb: 1, display: 'flex',justifyContent:'space-between', alignItems: 'center', width:'auto', marginTop:'1rem' }}>
            <Typography>Projektiin käytetty aika: {daysUsed}/{data.me.user.assignedProjectSingle.project.parentProject.duration} päivää</Typography>
            <Button variant="contained">Pyydä lisää aikaa</Button>
          </Box>
          <LinearProgress sx={{maxWidth:'100%'}} variant="determinate" value={100 / data.me.user.assignedProjectSingle.project.parentProject.duration * daysUsed} />
          {data.me.user.assignedProjectSingle.project.projectStatus === ProjectStatus.Working && 
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width:'auto', marginTop:'1rem'}}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                { recentlySaved && <Typography>Tallennettu</Typography>}
                <Button variant="contained" onClick={() => saveProject()}>Tallenna muutokset</Button>
              </Box>
              <Button variant="contained" onClick={() => returnProject()}>Palauta projekti</Button>
            </Box>
          }
        </Box>}
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
