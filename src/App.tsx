import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Login } from './components/auth/Login'; 
import StudentDashboard from './components/dashboards/studentDashboard'; 
import TeacherDashboard from './components/dashboards/teacherDashboard'; 
import './App.css';

export default function App() {
  const { instance, accounts } = useMsal();
  const [jobTitle, setJobTitle] = useState<string | null>(null);

  // Handle authentication persistence across page reloads
  useEffect(() => {
    if (!accounts.length && instance.getActiveAccount()) {
      instance.setActiveAccount(instance.getActiveAccount());
    }
  }, [instance, accounts]);

  // Fetch the job title from the backend
  useEffect(() => {
    const fetchJobTitle = async () => {
      if (accounts.length > 0) {
        const idToken = sessionStorage.getItem('idToken');
        if (idToken) {
          try {
            const response = await axios.post('/auth/login', { idToken }); // edit the endpoint 
            if (response.data.isValid) {
              setJobTitle(response.data.jobTitle);
            } else {
              setJobTitle(null);
            }
          } catch (error) {
            console.error("Failed to fetch job title:", error);
            setJobTitle(null);
          }
        }
      }
    };

    fetchJobTitle();
  }, [accounts]);

  return (
    <Router>
      <Routes>
        {/* 
          If user is authenticated, redirect them to the appropriate dashboard.
          If not, keep them on the login page.
        */}
        <Route path="/" element={accounts.length > 0 ? (
          jobTitle === 'oppilas' ? <Navigate to="/studentdashboard" /> :
          jobTitle === 'opettaja' ? <Navigate to="/teacherdashboard" /> :
          <Navigate to="/unknownrole" />
        ) : <Login />} />
        
        {/* 
          Protect the routes: 
          If the user is not authenticated, redirect to the login page.
        */}
        <Route path="/studentdashboard" element={accounts.length > 0 && jobTitle === 'oppilas' ? <StudentDashboard /> : <Navigate to="/" />} />
        <Route path="/teacherdashboard" element={accounts.length > 0 && jobTitle === 'opettaja' ? <TeacherDashboard /> : <Navigate to="/" />} />
        <Route path="/unknownrole" element={<div>Tapahtui virhe. Ota yhteyttä IT-Tukeen (unknown role)</div>} />
      </Routes>
    </Router>
  );
}





