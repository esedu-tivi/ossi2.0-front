//auth-provider.tsx 
//Hallinnoi käyttäjän autentikoinnin tilaa ja tarjoaa sen sovelluksen muille osille
import { ReactNode, useEffect, useState, useCallback } from "react";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance, handleMsalEventCallback } from "../utils/auth-utils";
import AuthContext from "../utils/auth-context";
import { useMutation } from "@apollo/client";
import { LOGIN_MUTATION } from "../graphql/LoginMutation";

interface AuthProviderProps {
  children: ReactNode;
}

//Hallinnoi autentikoinnin tilaa ja tarjoaa sen sovelluksen muille osille
export const AuthProvider = ({ children }: AuthProviderProps) => {

  //Pitää kirjaa käyttäjän kirjautumistilasta
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  //Säilyttää käyttäjän sähköpostiosoitteen, sekä päivittää sen kirjautumisen yhteydessä
  const [userEmail, setUserEmail] = useState("");

  //Käyttää LOGIN_MUTATIONia, joka on määritelty /components/graphql/LoginMutation.tsx tiedostossa
  const [loginMutation] = useMutation(LOGIN_MUTATION);

  //Lähettää idTokenin backendiin ja tarkastaa, että palautunut token on validi
  const sendIdTokenToBackend = useCallback(async (idToken: string) => {
    try {
      const { data } = await loginMutation({ variables: { idToken } });
      if (data && data.login && data.login.token) {
        sessionStorage.setItem("mutatedToken", data.login.token); 
      }
    } catch (error) {
      console.error("Failed to send idToken to backend:", error);
    }
  }, [loginMutation]); // Memoizes the function, only re-creating it if loginMutation changes

  useEffect(() => {

    //Setuppaa callbacking, joka kuuntelee MSAL eventit. Päivittää aktiivisen MSAL accountin ja userEmail + isAuthenticated tilan
    //Palauttaa callback ID:n, jotta se voidaan poistaa myöhemmin memory leaksien varalta
    const callbackId = handleMsalEventCallback(setUserEmail, setIsAuthenticated);

    //Käsittelee kirjautumisen yhteydessä olevan redirectin, joka on tullut MSALin kautta
    const initializeMsal = async () => {
      try {
        
        if (!msalInstance) {
          throw new Error("MSAL instance is not initialized");
        }

        await msalInstance.initialize();

        //handleRedirectPromise palauttaa AuthenticationResultin, joka sisältää käyttäjän tiedot, jos kirjautuminen onnistui
        //account, idToken, accessToken
        const redirectResponse = await msalInstance.handleRedirectPromise();

        //Tarkastaa oliko kirjautuminen validi, sekä käyttäjätietojen olemassaolon
        //Jos true, niin kirjautuminen oli onnistunut ja käyttäjä redirectataan takaisin sovellukseen
        if (redirectResponse?.account) {
          //Asettaa käyttäjän aktiiviseksi MSAL accountiksi
          msalInstance.setActiveAccount(redirectResponse.account);
          //Säilyttää käyttäjän sähköpostiosoitteen komponentin tilassa
          setUserEmail(redirectResponse.account.username);
          //Asettaa käyttäjän autentikoinnin tilan trueksi (käyttäjä on logged in)
          setIsAuthenticated(true);

          //Erottaa idTokenin responsesta ja tekee siitä muuttujan backend lähetystä varten
          const idToken = redirectResponse.idToken;

          //Lähettää idTokenin backendiin mutatointiin
          sendIdTokenToBackend(idToken);
        }
      } catch (error) {
        console.error("MSAL initialization error:", error);
      }
    };

    //Poistaa event callbackin
   if (msalInstance) {
    initializeMsal();
  }
    
    return () => {
      if (callbackId) {
        msalInstance.removeEventCallback(callbackId);
      }
    };
  }, [sendIdTokenToBackend]); // Adds sendIdTokenToBackend as a dependency, ensuring the effect re-runs only if it changes

  return (

    //Tarjoaa isAuthenticated, userEmail, setIsAuthenticated ja setUserEmail funktiot muille sovelluksen osille AuthContextin kautta
    <AuthContext.Provider value={{ isAuthenticated, userEmail, setIsAuthenticated, setUserEmail }}>
      <MsalProvider instance={msalInstance}>
        {children}
      </MsalProvider>
    </AuthContext.Provider>
  );
};
