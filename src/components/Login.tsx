import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../authConfig"; 
import "../css/Login.css";

const Login = () => {
  const { instance} = useMsal();

  // Starts login using redirect flow
  // User is navigated to Microsoft login screen
  // When login is successful user is redirected back to program with the authentication data
  const handleLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">ESEDU OSSI</h2>
        <button className="login-button" onClick={handleLogin}>
          Kirjaudu Sisään
        </button>
      </div>
    </div>
  );
};

export default Login;
