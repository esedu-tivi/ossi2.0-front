import { useMsal } from '@azure/msal-react';
import { Button } from '@mui/material';
import { loginRequest } from '../../authConfig';
import axios from 'axios';


export const Login = () => {
    const { instance } = useMsal();
  
    const handleLogin = async () => {
      try {
        await instance.loginRedirect(loginRequest);
        
        // After login completes, use acquireTokenSilent to get the access token
        const account = instance.getActiveAccount(); // Get the active account after login
        if (account) {
          const tokenResponse = await instance.acquireTokenSilent({
            ...loginRequest,
            account: account
          });

          const accessToken = tokenResponse.accessToken;
          const idToken = tokenResponse.idToken;

          // console.log("Access Token:", accessToken); **Commented out for security reasons**
          console.log("ID Token:", idToken); // Log the idToken for development
          
          // Store the access token in sessionStorage
          sessionStorage.setItem('accessToken', accessToken);
          sessionStorage.setItem('idToken', idToken);
          
          console.log("Access Token stored in sessionStorage:", accessToken);
          console.log("ID Token stored in sessionStorage:", idToken);

          // Call the API with the idtoken
          const response = await axios.post('/api/validate-token', { idToken });

          // Based on the backend response, redirect the user
          if (response.data.isValid) {
            const jobTitle = response.data.jobTitle;
            if (jobTitle === 'oppilas') {
              window.location.href = '/studentdashboard';
            } else if (jobTitle === 'opettaja') {
              window.location.href = '/teacherdashboard';
            } else {
              window.location.href = '/unknownrole'; // Redirect to an error page or a default page
            }
          } else {
            window.location.href = '/login-error'; // Redirect to an error page
          }

        }
      } catch (error) {
        console.error("Login failed:", error);
      }
    };
  
    return (
      <div className="login-screen">
        <h2>Tervetuloa OSSIIN</h2>
        <Button variant="contained" color="primary" onClick={handleLogin}>
          Kirjaudu Sisään
        </Button>
      </div>
    );
};

