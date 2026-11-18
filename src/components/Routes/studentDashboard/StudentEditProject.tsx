import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PlateEditor from '@/components/common/plate-editor';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ProjectStatus } from '../../../types';
import TimeTrackingTable from './TimeTrackingTable';
import { UPDATE_STUDENT_PROJECT } from '../../../graphql/UpdateStudentProject';
import { GET_STUDENT_PROJECTS } from '../../../graphql/GetStudentProjects';
import { UNASSIGN_STUDENT_PROJECT } from '../../../graphql/UnassignStudentProject';
import ProjectDescription from './ProjectDescription';
import { GET_ASSIGNED_PROJECT } from '../../../graphql/GetAssignedProject';

interface StudentEditProjectProps {
  open: boolean;
  onClose: () => void;
  studentId: number;
  projectId: number | null;
  setProjectId: (id: number | null) => void;
}

const StudentEditProject: React.FC<StudentEditProjectProps> = ({ open, onClose, studentId, projectId, setProjectId }) => {
  const [formData, setFormData] = useState({ plan: '', report: '', message: '' });
  const [daysUsed, setDaysUsed] = useState(0);
  const [recentlySaved, setRecentlySaved] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { confirm, ConfirmDialog } = useConfirmDialog();

  const { data, loading } = useQuery(GET_ASSIGNED_PROJECT, { variables: { projectId }, skip: projectId === null });

  const [unassignProject] = useMutation(UNASSIGN_STUDENT_PROJECT, { refetchQueries: [GET_STUDENT_PROJECTS] });
  const [updateProject] = useMutation(UPDATE_STUDENT_PROJECT, {
    refetchQueries: [GET_ASSIGNED_PROJECT, GET_STUDENT_PROJECTS], onCompleted: () => {
      setRecentlySaved(true);
      setTimeout(() => setRecentlySaved(false), 5000);
    }
  });

  useEffect(() => {
    if (loading || !projectId || !data) {
      return;
    }
    const assignedProject = data.me.user.assignedProjectSingle.project;

    setFormData((prevFormData) => ({
      ...prevFormData,
      plan: assignedProject.projectPlan,
      report: assignedProject.projectReport,
      message: assignedProject.teacherComment === '' ? 'Feedback not provided' : assignedProject.teacherComment,
    }));

    let timeDifference = 0;
    if (assignedProject.deadline && assignedProject.startDate) {
      timeDifference = (assignedProject.deadline?.valueOf() - assignedProject.startDate?.valueOf()) - (assignedProject.deadline?.valueOf() - new Date().valueOf());
    }
    setDaysUsed(Math.floor(timeDifference / 1000 / 60 / 60 / 24));
  }, [data, loading, projectId]);

  if (loading || !projectId || !data) {
    return null;
  }

  const handleChange = (content: string, field: 'plan' | 'report') => {
    const newContent = content;
    setFormData({ ...formData, [field]: newContent });
  };

  const handleClose = async () => {
    if (!data.me.user.assignedProjectSingle.project) {
      console.log('project is undefined');
      return;
    }

    if (data.me.user.assignedProjectSingle.project.projectStatus === ProjectStatus.Working) {
      await saveProject();
    }

    onClose();
  };

  const cancelProject = async () => {
    if (!data.me.user.assignedProjectSingle.project) {
      console.log('project is undefined');
      return;
    }

    setProjectId(null);
    await unassignProject({ variables: { studentId, projectId: data.me.user.assignedProjectSingle.project.parentProject.id } });

    onClose();
  };

  const returnProject = async () => {
    await saveProject(ProjectStatus.Returned);

    onClose();
  };

  const saveProject = async (setStatus = data.me.user.assignedProjectSingle.project?.projectStatus) => {
    if (!data.me.user.assignedProjectSingle.project) {
      console.log('project is undefinded');
      return;
    }
    if (String(formData.plan).includes('<p>') || String(formData.plan).includes('&nbsp;')) {
      formData.plan = formData.plan.replace(/<\/?p>/g, '').replace(/&nbsp;/g, '');
    }
    if (String(formData.report).includes('<p>') || String(formData.report).includes('&nbsp;')) {
      formData.report = formData.report.replace(/<\/?p>/g, '').replace(/&nbsp;/g, '');
    }
    const projectUpdate = { projectPlan: formData.plan, projectReport: formData.report, projectStatus: setStatus };
    await updateProject({ variables: { studentId, projectId: data.me.user.assignedProjectSingle.project.parentProject.id, update: projectUpdate } });
  };

  const handleCancelProject = async () => {
    setMenuOpen(false);
    const confirmed = await confirm({
      title: 'Peruuta projekti',
      description: 'Haluatko varmasti peruuttaa projektin?',
      confirmText: 'Kyllä',
      cancelText: 'Ei',
    });
    if (confirmed) {
      await cancelProject();
    }
  };

  const progressPercent = data.me.user.assignedProjectSingle.project.parentProject.duration > 0
    ? Math.min(100, (100 / data.me.user.assignedProjectSingle.project.parentProject.duration) * daysUsed)
    : 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{data.me.user.assignedProjectSingle.project.parentProject.name}</DialogTitle>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Projektin asetukset"
            >
              <Settings className="h-5 w-5" />
            </Button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 min-w-[200px] rounded-md border bg-popover p-1 shadow-md">
                <button
                  className="w-full rounded-sm px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                  onClick={() => { setDescriptionOpen(true); setMenuOpen(false); }}
                  aria-label="Avaa projektin kuvaus"
                >
                  Projektin kuvaus
                </button>
                <button
                  className="w-full rounded-sm px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                  onClick={() => { setMenuOpen(false); }}
                  aria-label="Pyydä lisää aikaa"
                >
                  Pyydä lisää aikaa
                </button>
                <button
                  className="w-full rounded-sm px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-accent"
                  onClick={handleCancelProject}
                  aria-label="Peruuta projekti"
                >
                  Peruuta projekti
                </button>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <PlateEditor
                height={300}
                label="Suunnitelma"
                value={formData.plan}
                onChange={(content) => handleChange(content, 'plan')}
              />
            </div>
            <div className="flex-1">
              <PlateEditor
                height={300}
                label="Raportti"
                value={formData.report}
                onChange={(content) => handleChange(content, 'report')}
              />
            </div>
          </div>

          <div>
            <h3 className="px-1 text-lg font-semibold text-muted-foreground">Feedback</h3>
            <p className="px-1">{formData.message}</p>
          </div>

          <TimeTrackingTable project={data.me.user.assignedProjectSingle.project} studentId={studentId} />

          {data.me.user.assignedProjectSingle.project.projectStatus === ProjectStatus.Working && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  Projektiin käytetty aika: {daysUsed}/{data.me.user.assignedProjectSingle.project.parentProject.duration} päivää
                </p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-col gap-2">
                  {recentlySaved && <p className="text-sm text-muted-foreground">Tallennettu</p>}
                  <Button onClick={() => saveProject()}>Tallenna muutokset</Button>
                </div>
                <Button onClick={() => returnProject()}>Palauta projekti</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      <ProjectDescription
        project={data.me.user.assignedProjectSingle.project.parentProject}
        descriptionOpen={descriptionOpen}
        onClose={() => setDescriptionOpen(false)}
      />
      <ConfirmDialog />
    </Dialog>
  );
};

export default StudentEditProject;
