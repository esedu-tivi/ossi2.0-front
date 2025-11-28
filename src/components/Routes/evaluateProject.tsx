import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Dialog, DialogTitle, Typography } from "@mui/material"
import RichTextEditor from "../common/RichTextEditor"
import { useMutation } from "@apollo/client";
import { GET_ASSIGNED_PROJECT } from "../../graphql/GetAssignedProject";
import { GET_STUDENT_PROJECTS } from "../../graphql/GetStudentProjects";
import { UPDATE_STUDENT_PROJECT } from "../../graphql/UpdateStudentProject";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState } from "react";
//import formStyles from "../../styles/formStyles";


const EvaluateProject=({ project, studentId, })=>{
    const [updateProject] = useMutation(UPDATE_STUDENT_PROJECT, {refetchQueries: [GET_ASSIGNED_PROJECT, GET_STUDENT_PROJECTS]})
      const [feedback, setFeedback]= useState('')
      const addFeedback = async () =>{
         const projectUpdate = { projectStatus: "ACCEPTED", teacherComment: feedback};
        await updateProject({ variables: { studentId, projectId: project.projectId,projectPlan: project.projectPlan, 
            projectReport: project.projectPlan, update: projectUpdate }});
        setFeedback('')
      }
      const handleFeedback = (content) =>{//function formats feedback so there are no html components and no null present
        let newContent = content;
        if(String(content).includes('<p>')){
            newContent = content.replace('<p>','').replace('</p>','');
        }
        setFeedback(newContent)
      }
      const styles = {
        text:{
            display:'flex',
            allignItems:'center',
            px: 1,
        },
        box:{
            dispaly:'flex',
            flexDirection:'column',
            backGroundColor:'#95a5a6'
        }
      }
      if(project.projectStatus==='WORKING'){
        console.log(project)
        return(
            <Accordion disableGutters={true} sx={{ border: '1px solid #95a5a6', backgroundColor:'#c6c6c6ff', width:'100%' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography style={styles.text}>{project.parentProject.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography style={styles.text}>Plan</Typography>
                    <Typography style={styles.text}>{project.projectPlan}</Typography>
                </AccordionDetails>
                <AccordionDetails>
                    <Typography style={styles.text}>Raport</Typography>
                    <Typography style={styles.text}>{project.projectReport}</Typography>
                </AccordionDetails>
                <AccordionDetails>
                    <Typography style={styles.text}>Feedback</Typography>
                    <Typography style={styles.text}>{project.teacherComment}</Typography>
                </AccordionDetails>
            </Accordion>
        )
      }
      if(project.projectStatus==='RETURNED'){
        return(
            <Accordion disableGutters={true} sx={{ border: '1px solid #95a5a6', backgroundColor: '#979797ff',width:'100%' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{project.parentProject.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>Plan</Typography>
                    <Typography>{project.projectPlan}</Typography>
                </AccordionDetails>
                <AccordionDetails>
                    <Typography style={styles.text}>Raport</Typography>
                    <Typography style={styles.text}>{project.projectReport}</Typography>
                </AccordionDetails>
                <AccordionDetails>
                    <RichTextEditor height={180} label="Feedback" value={feedback} onChange={(content) => handleFeedback(content)}/>
                    <Button onClick={addFeedback}>Accept Assignment</Button>
                </AccordionDetails>
            </Accordion>
    )
      }
    if(project.projectStatus==='ACCEPTED'){
        return(
            <Accordion disableGutters={true} sx={{ border: '1px solid #95a5a6', backgroundColor:'#94FF7C', width:'100%' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography style={styles.text}>{project.parentProject.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography style={styles.text}>Plan</Typography>
                    {project.projectPlan}
                </AccordionDetails>
                <AccordionDetails>
                    <Typography style={styles.text}>Raport</Typography>
                    <Typography style={styles.text}>{project.projectReport}</Typography>
                </AccordionDetails>
                <AccordionDetails>
                    <Typography style={styles.text}>Feedback</Typography>
                    <Typography style={styles.text}>{project.teacherComment}</Typography>
                </AccordionDetails>
            </Accordion>
        )
      }
}

export default EvaluateProject