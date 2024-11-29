import { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import TeacherDashboard from "./components/Routes/teacherDashboard";
import StudentDashboard from "./components/Routes/studentDashboard";
import { useAuth } from "./utils/auth-context";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./components/Login";
import TeacherProjectsView from "./components/Routes/TeacherProjectsView";
import CreateProject from './components/Routes/CreateProject';
import AppLayout from "./components/AppLayout";
import ProjectDetails from "./components/Routes/ProjectDetails";
import EditProject from './components/Routes/EditProject';

const App = () => {
  const { isAuthenticated, userEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  // Prevent redirects if the user is already on a valid route.
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Current location:", location.pathname);
  
      const isTeacherRoute = userEmail.endsWith("@esedulainen.fi");
      const isStudentRoute = userEmail.endsWith("@esedu.fi");
  
      if (
        isTeacherRoute &&
        !location.pathname.startsWith("/teacherdashboard") &&
        !location.pathname.startsWith("/teacherprojects")
      ) {
        console.log("Redirecting to /teacherdashboard");
        navigate("/teacherdashboard");
      } else if (
        isStudentRoute &&
        !location.pathname.startsWith("/studentdashboard")
      ) {
        console.log("Redirecting to /studentdashboard");
        navigate("/studentdashboard");
      }
    }
  }, [isAuthenticated, userEmail, navigate, location]);
  

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/teacherdashboard"
        element={
          <ProtectedRoute
            element={
              <AppLayout>
                <TeacherDashboard />
              </AppLayout>
            }
          />
        }
      />
      <Route
        path="/studentdashboard"
        element={
          <ProtectedRoute
            element={
              <AppLayout>
                <StudentDashboard />
              </AppLayout>
            }
          />
        }
      />
      <Route
        path="/teacherprojects"
        element={
          <ProtectedRoute
            element={
              <AppLayout>
                <TeacherProjectsView />
              </AppLayout>
            }
          />
        }
      />
      <Route
        path="/teacherprojects/new"
        element={
          <ProtectedRoute
            element={
              <AppLayout>
                <CreateProject/>
              </AppLayout>
            }
          />
        }
      />
      <Route
        path="/teacherprojects/edit"
        element={
          <ProtectedRoute
            element={
              <AppLayout>
                <EditProject/>
              </AppLayout>
            }
          />
        }
      />
      <Route
        path="/teacherprojects/:projectId"
        element={
          <ProtectedRoute
            element={
              <AppLayout>
                <ProjectDetails />
              </AppLayout>
            }
          />
        }
      />
    </Routes>
  );
};

export default App;
