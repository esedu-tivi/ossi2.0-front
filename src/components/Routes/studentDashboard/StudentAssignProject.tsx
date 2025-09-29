import { Box, Button, Dialog, DialogTitle} from "@mui/material";
import React, { useEffect, useState } from "react";
import RichTextEditor from "../../common/RichTextEditor";
import { BaseProject } from "./types";
import { useMutation } from "@apollo/client";
import { ASSIGN_STUDENT_PROJECT } from "../../../graphql/AssignStudentProject";
import { GET_STUDENT_PROJECTS } from "../../../graphql/GetStudentProjects";
import ProjectDescription from "./ProjectDescription";

interface StudentAssignProjectProps {
  open: boolean;
  onClose: () => void;
  studentId: number;
  project: BaseProject|null;
};

const StudentAssignProject: React.FC<StudentAssignProjectProps> = ({ open, onClose, studentId, project }) => {
  const [formData, setFormData] = useState({ plan: '', report: '' });
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [assignProject] = useMutation(ASSIGN_STUDENT_PROJECT, {refetchQueries: [GET_STUDENT_PROJECTS]});

  useEffect(() => {
    if (!project) {
      console.log('project is undefined');
      return;
    };

    setFormData({plan: '', report: ''});
  }, [open]);

  if (!project) {
    return;
  }

  const handleChange = (content: string, field: 'plan' | 'report') => {
    setFormData({...formData, [field]: content});
  };

  const handleClose = async () => {
    onClose();
    setFormData({ plan: '', report: '' });
  };

  const startProject = async () => {
    if (!project?.duration) {
      console.log('duration is undefined');
      return
    };

    await assignProject({ variables: { studentId, projectId: project.id }});

    onClose();
    setFormData({ plan: '', report: '' });
  };

  return (
    <Dialog maxWidth="md" open={open} onClose={() => handleClose()}>
      <Box sx={{ px: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <DialogTitle sx={{ width: '60%' }}>{project.name}</DialogTitle>
        <Button variant="contained" onClick={() => setDescriptionOpen(true)}>Projektin kuvaus</Button>
      </Box>
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
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => startProject()}>Aloita projekti</Button>
        </Box>
      </Box>
      <ProjectDescription project={project} descriptionOpen={descriptionOpen} onClose={() => setDescriptionOpen(false)} />
    </Dialog>
  );
};

export default StudentAssignProject;
