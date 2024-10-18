//auth-context.ts toimii AuthProviderin (auth-provider.tsx) kanssa  säilyttäen käyttäjän autentikoinnin statuksen

import { createContext, useContext } from "react";

//Määritellään AuthContextProps interface. Data voidaan jakaa contextin kautta sovelluksen muille osille
interface AuthContextProps {
  isAuthenticated: boolean;
  userEmail: string;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setUserEmail: (email: string) => void;
}


const AuthContext = createContext<AuthContextProps>({
  //Default arvot
  isAuthenticated: false,
  userEmail: "",

  //Placeholderit AuthProviderin tarjoamille funktioille
  setIsAuthenticated: () => {},
  setUserEmail: () => {},
});

//Wrappaa useContext(AuthContext) hookin, jotta sitä voidaan käyttää sovelluksen muissa osissa helposti
export const useAuth = () => useContext(AuthContext);

export default AuthContext;

