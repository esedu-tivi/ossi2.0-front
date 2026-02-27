import React, { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PlateEditor from '@/components/common/plate-editor';
import { BaseProject } from '../../../types';
import { ASSIGN_STUDENT_PROJECT } from '../../../graphql/AssignStudentProject';
import { GET_STUDENT_PROJECTS } from '../../../graphql/GetStudentProjects';
import ProjectDescription from './ProjectDescription';

interface StudentAssignProjectProps {
  open: boolean;
  onClose: () => void;
  studentId: number;
  project: BaseProject | null;
}

const StudentAssignProject: React.FC<StudentAssignProjectProps> = ({ open, onClose, studentId, project }) => {
  const [formData, setFormData] = useState({ plan: '', report: '' });
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [assignProject] = useMutation(ASSIGN_STUDENT_PROJECT, { refetchQueries: [GET_STUDENT_PROJECTS] });

  useEffect(() => {
    if (!project) return;
    setFormData({ plan: '', report: '' });
  }, [open]);

  if (!project) {
    return null;
  }

  const handleChange = (content: string, field: 'plan' | 'report') => {
    setFormData({ ...formData, [field]: content });
  };

  const handleClose = async () => {
    onClose();
    setFormData({ plan: '', report: '' });
  };

  const startProject = async () => {
    if (!project?.duration) {
      console.log('duration is undefined');
      return;
    }

    await assignProject({ variables: { studentId, projectId: project.id } });

    onClose();
    setFormData({ plan: '', report: '' });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex-1">{project.name}</DialogTitle>
          <Button variant="outline" onClick={() => setDescriptionOpen(true)}>
            Projektin kuvaus
          </Button>
        </DialogHeader>
        <div className="space-y-4">
          <PlateEditor
            height={180}
            label="Suunnitelma"
            value={formData.plan}
            onChange={(content) => handleChange(content, 'plan')}
          />
          <PlateEditor
            height={180}
            label="Raportti"
            value={formData.report}
            onChange={(content) => handleChange(content, 'report')}
          />
          <div>
            <Button onClick={() => startProject()}>Aloita projekti</Button>
          </div>
        </div>
      </DialogContent>
      <ProjectDescription project={project} descriptionOpen={descriptionOpen} onClose={() => setDescriptionOpen(false)} />
    </Dialog>
  );
};

export default StudentAssignProject;
