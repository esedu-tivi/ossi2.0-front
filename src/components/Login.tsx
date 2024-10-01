import { useMsal } from '@azure/msal-react';
import { Button } from '@mui/material';
import { loginRequest } from '../authConfig';

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
          console.log("Access Token:", accessToken); // Log the token for development
          
          // Store the access token in sessionStorage
          sessionStorage.setItem('accessToken', accessToken);
          
          console.log("Access Token stored in sessionStorage:", accessToken);
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

