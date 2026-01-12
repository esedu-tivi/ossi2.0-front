import React, { ReactNode } from "react";
import DrawerMenu from "./DrawerMenu";
import { Box } from "@mui/material";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  console.log("AppLayout rendered"); // Check if AppLayout renders
  return (
    <div style={{ display: "flex" }}>
      <DrawerMenu />
      <Box sx={{ flexGrow: 1, padding: "20px" }}>
        {children}
      </Box>
    </div>
  );
};

export default AppLayout;


