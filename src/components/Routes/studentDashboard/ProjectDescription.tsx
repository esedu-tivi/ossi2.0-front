import { Dialog, DialogTitle, DialogContent, Typography } from "@mui/material";
import React from "react";
import { BaseProject } from "../../../types";

interface ProjectDescriptionProps {
  project: BaseProject;
  descriptionOpen: boolean;
  onClose: () => void;
};

const ProjectDescription: React.FC<ProjectDescriptionProps> = ({ project, descriptionOpen, onClose }) => {
  return (
    <Dialog open={descriptionOpen} onClose={onClose}>
      <DialogTitle>{project?.name}</DialogTitle>
      <DialogContent>
        <Typography>{project?.description}</Typography>
        <Typography>{project?.materials}</Typography>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDescription