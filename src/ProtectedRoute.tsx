// Makes sure user is on the correct dashboard
// Logic is stored in auth-provider.tsx and App.tsx

import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./utils/auth-context";

interface ProtectedRouteProps {
  element: React.ReactNode;
  allowedRoles?: ("student" | "teacher" | "unknown")[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {

    // If user is not logged in they will be forwarded back to login page
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
      console.warn(`Unauthorized access attempt to ${location.pathname} by ${role}`);
      navigate(role === "teacher" ? "/teacherdashboard" : "/studentdashboard");
    }
  }, [isAuthenticated, navigate, role, allowedRoles, location.pathname]);

  // Element will only be rendered if user is logged in
  return <>{isAuthenticated && (!allowedRoles || allowedRoles.includes(role)) && element}</>;
};

export default ProtectedRoute;



