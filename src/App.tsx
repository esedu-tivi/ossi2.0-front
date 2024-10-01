import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { useMsal } from '@azure/msal-react';
import './App.css';

export default function App() {
  const { instance, accounts } = useMsal();  // Get the MSAL instance and accounts

  // Handle authentication persistence across page reloads
  useEffect(() => {
    if (!accounts.length && instance.getActiveAccount()) {
      instance.setActiveAccount(instance.getActiveAccount());
    }
  }, [instance, accounts]);

  return (
    <Router>
      
        <Routes>
          {/* 
            If user is authenticated, redirect them to the dashboard.
            If not, keep them on the login page.
          */}
          <Route path="/" element={accounts.length > 0 ? <Navigate to="/dashboard" /> : <Login />} />
          
          {/* 
            Protect the dashboard route: 
            If the user is not authenticated, redirect to the login page.
          */}
          <Route path="/dashboard" element={accounts.length > 0 ? <Dashboard /> : <Navigate to="/" />} />
        </Routes>
      
    </Router>
  );
}





