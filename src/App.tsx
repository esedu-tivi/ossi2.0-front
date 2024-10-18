import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import TeacherDashboard from "./components/dashboards/teacherDashboard";
import StudentDashboard from "./components/dashboards/studentDashboard";
import { useAuth } from "./utils/auth-context";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./components/Login";

const App = () => {
  const { isAuthenticated, userEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (userEmail.endsWith("@esedulainen.fi")) {
        navigate("/studentdashboard");
      } else if (userEmail.endsWith("@esedu.fi")) {
        navigate("/teacherdashboard");
      }
    }
  }, [isAuthenticated, userEmail, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/teacherdashboard"
        element={<ProtectedRoute element={<TeacherDashboard />} />}
      />
      <Route
        path="/studentdashboard"
        element={<ProtectedRoute element={<StudentDashboard />} />}
      />
    </Routes>
  );
};

export default App;











