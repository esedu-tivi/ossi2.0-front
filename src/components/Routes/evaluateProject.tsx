import PlateEditor from "@/components/common/plate-editor"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/common/app-accordion"
import { useMutation } from "@apollo/client";
import { GET_ASSIGNED_PROJECT } from "../../graphql/GetAssignedProject";
import { GET_STUDENT_PROJECTS } from "../../graphql/GetStudentProjects";
import { UPDATE_STUDENT_PROJECT } from "../../graphql/UpdateStudentProject";
import { useState } from "react";
import { AssignedProject } from "../../types";

const EvaluateProject=({ project, studentId }: { project: AssignedProject, studentId: number })=>{
    const [updateProject] = useMutation(UPDATE_STUDENT_PROJECT, {refetchQueries: [GET_ASSIGNED_PROJECT, GET_STUDENT_PROJECTS]})
      const [feedback, setFeedback]= useState('')
      const addFeedback = async () =>{
        let newFeedback = feedback;
        if(String(feedback).includes('<p>') || String(feedback).includes('&nbsp;') ){
            newFeedback = feedback.replace(/<\/?p>/g, '').replace(/&nbsp;/g, '');
        }
         const projectUpdate = { projectStatus: "ACCEPTED", teacherComment: newFeedback };
        await updateProject({ variables: { studentId, projectId: project.projectId,projectPlan: project.projectPlan,
            projectReport: project.projectPlan, update: projectUpdate }});
        setFeedback('')
      }
      const handleFeedback = (content: string) =>{
        const newContent = content;
        setFeedback(newContent)
      }

      if(project.projectStatus==='WORKING'){
        console.log(project)
        return(
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item" className="border rounded bg-muted/30">
                <AccordionTrigger className="px-3">
                    <span className="flex items-center px-1">{project.parentProject.name}</span>
                </AccordionTrigger>
                <AccordionContent className="px-3 space-y-2">
                    <p className="flex items-center px-1 font-medium">Plan</p>
                    <p className="flex items-center px-1">{project.projectPlan}</p>
                    <p className="flex items-center px-1 font-medium">Raport</p>
                    <p className="flex items-center px-1">{project.projectReport}</p>
                    <p className="flex items-center px-1 font-medium">Feedback</p>
                    <p className="flex items-center px-1">{project.teacherComment}</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
        )
      }
      if(project.projectStatus==='RETURNED'){
        return(
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item" className="border rounded bg-muted/30">
                <AccordionTrigger className="px-3">
                    {project.parentProject.name}
                </AccordionTrigger>
                <AccordionContent className="px-3 space-y-2">
                    <p className="font-medium">Plan</p>
                    <p>{project.projectPlan}</p>
                    <p className="font-medium">Raport</p>
                    <p className="flex items-center px-1">{project.projectReport}</p>
                    <PlateEditor height={180} label="Feedback" value={feedback} onChange={(content) => handleFeedback(content)}/>
                    <Button onClick={addFeedback}>Accept Assignment</Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
    )
      }
    if(project.projectStatus==='ACCEPTED'){
        return(
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item" className="border rounded bg-green-100">
                <AccordionTrigger className="px-3">
                    <span className="flex items-center px-1">{project.parentProject.name}</span>
                </AccordionTrigger>
                <AccordionContent className="px-3 space-y-2">
                    <p className="flex items-center px-1 font-medium">Plan</p>
                    <p>{project.projectPlan}</p>
                    <p className="flex items-center px-1 font-medium">Raport</p>
                    <p className="flex items-center px-1">{project.projectReport}</p>
                    <p className="flex items-center px-1 font-medium">Feedback</p>
                    <p className="flex items-center px-1">{project.teacherComment}</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
        )
      }
}

export default EvaluateProject
