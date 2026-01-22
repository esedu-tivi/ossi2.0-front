import React, { ReactNode, useState } from "react";
import DrawerMenu from "./DrawerMenu";
import { Box } from "@mui/material";
import CustomToolbar from "./CustomToolbar";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  console.log("AppLayout rendered"); // Check if AppLayout renders

  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("Otsikko");

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  return (
    <div>
      <CustomToolbar handleDrawerToggle={handleDrawerToggle} title={title} />
      <Box style={{ display: "flex" }}>
        <DrawerMenu
          mobileOpen={mobileOpen}
          handleDrawerClose={handleDrawerClose}
          handleDrawerTransitionEnd={handleDrawerTransitionEnd}
        />
        <Box sx={{ flexGrow: 1, padding: "20px" }}>{children}</Box>
      </Box>
    </div>
  );
};

export default AppLayout;
