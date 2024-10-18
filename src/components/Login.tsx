import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig"; 
import "../css/Login.css";

const Login = () => {
  const { instance} = useMsal();

  //Aloittaa kirjautumisen käyttäen redirect flowta
  //Käyttäjä ohjataan Microsoftin kirjautumissivulle
  //Kun kirjautuminen onnistuu, käyttäjä ohjataan takaisin sovellukseen autentikointi tietojen kanssa
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
