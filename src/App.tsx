import { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import TeacherDashboard from "./components/Routes/teacherDashboard";
import StudentDashboard from "./components/Routes/studentDashboard";
import { useAuth } from "./utils/auth-context";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./components/Login";
import TeacherProjectsView from "./components/Routes/TeacherProjectsView";
import AppLayout from "./components/AppLayout";

const App = () => {
  const { isAuthenticated, userEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  // Prevent redirects if the user is already on a valid route. Terrible implementation, but it works for now.
  // To be fixed
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Current location:", location.pathname);

      const isTeacherRoute = userEmail.endsWith("@esedu.fi");
      const isStudentRoute = userEmail.endsWith("@esedulainen.fi");

      
      if (isTeacherRoute && !["/teacherdashboard", "/teacherprojects"].includes(location.pathname)) {
        console.log("Redirecting to /teacherdashboard");
        navigate("/teacherdashboard");
      } else if (isStudentRoute && location.pathname !== "/studentdashboard") {
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
    </Routes>
  );
};

export default App;
