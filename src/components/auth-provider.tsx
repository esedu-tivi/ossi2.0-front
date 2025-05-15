// Controls user authentication and provides it to other components in the program

import { ReactNode, useEffect, useState, useCallback } from "react";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance, handleMsalEventCallback } from "../utils/auth-utils";
import AuthContext from "../utils/auth-context";
import { useMutation } from "@apollo/client";
import { LOGIN_MUTATION } from "../graphql/LoginMutation";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {

  // Manages user login state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Manages user Email data
  const [userEmail, setUserEmail] = useState("");

  const [loginMutation] = useMutation(LOGIN_MUTATION);

  const [role, setRole] = useState<'teacher' | 'student' | 'unknown'>('unknown');

  useEffect(() => {
    if (userEmail.endsWith('@esedulainen.fi')) {
      setRole('student');
    } else if (userEmail.endsWith('@esedu.fi')) {
      setRole('teacher');
    } else {
      setRole('unknown');
    }
  }, [userEmail]);

  // Sends idToken to backend and checks if the returned token is valid
  const sendIdTokenToBackend = useCallback(async (idToken: string) => {
    try {
      const { data } = await loginMutation({ variables: { idToken } });
      if (data && data.login && data.login.token) {
        sessionStorage.setItem("mutatedToken", data.login.token); 
      }
    } catch (error) {
      console.error("Failed to send idToken to backend:", error);
    }
  }, [loginMutation]); // Memorizes the function, only re-creating it if loginMutation changes

  useEffect(() => {
    // Setups callback which listens to MSAL events. Updates active MSAL account, userEmail and isAuthenticated state
    // Returns callback ID so it can be removed later in case of memory leaks
    const callbackId = handleMsalEventCallback(setUserEmail, setIsAuthenticated);

    // Handles redirect during login
    const initializeMsal = async () => {
      try {
        
        if (!msalInstance) {
          throw new Error("MSAL instance is not initialized");
        }

        await msalInstance.initialize();

        // handleRedirectPromise returns AuthenticationResult which contains user data if login was successful
        const redirectResponse = await msalInstance.handleRedirectPromise();

        // Checks if login was valid and if user data exists
        // If true the login is successful and user is redirected back to the program
        if (redirectResponse?.account) {
          // Sets user as active MSAL account
          msalInstance.setActiveAccount(redirectResponse.account);
          setUserEmail(redirectResponse.account.username);

          // Separates idToken from response and saves it in variable
          const idToken = redirectResponse.idToken;

          // Sends idToken to backend mutation
          // Temp log idToken for testing, REMOVE when not needed anymore
          console.log(idToken)
          await sendIdTokenToBackend(idToken);

          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("MSAL initialization error:", error);
      }
    };

    // Removes event callback
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

    // Provides isAuthenticated, userEmail, setIsAuthenticated, role, setRole and setUserEmail functions to other components through auth-context
    <AuthContext.Provider value={{ isAuthenticated, userEmail, role, setIsAuthenticated, setUserEmail, setRole }}>
      <MsalProvider instance={msalInstance}>
        {children}
      </MsalProvider>
    </AuthContext.Provider>
  );
};
