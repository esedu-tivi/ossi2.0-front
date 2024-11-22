import React, { ReactNode } from "react";
import DrawerMenu from "./DrawerMenu";
import UserProfile from "./UserProfile";
import { Box, Drawer, Toolbar } from "@mui/material";

interface AppLayoutProps {
  children: ReactNode;
}

const drawerWidth = 240;

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    console.log("AppLayout rendered"); // Check if AppLayout renders
  return (
    <div style={{ display: "flex" }}>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            overflow: 'auto',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <Box sx={{ padding: 2, border: '1px solid red', backgroundColor: '#f0f0f0' }}>
          <UserProfile />
        </Box>
        <DrawerMenu />
      </Drawer>
      <Box sx={{ flexGrow: 1, padding: "20px" }}>
        {children}
      </Box>
    </div>
  );
};

export default AppLayout;


