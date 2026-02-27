import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BaseProject } from '../../../types';

interface ProjectDescriptionProps {
  project: BaseProject;
  descriptionOpen: boolean;
  onClose: () => void;
}

const ProjectDescription: React.FC<ProjectDescriptionProps> = ({ project, descriptionOpen, onClose }) => {
  return (
    <Dialog open={descriptionOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{project?.name}</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2">
              <p>{project?.description}</p>
              <p>{project?.materials}</p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDescription;
