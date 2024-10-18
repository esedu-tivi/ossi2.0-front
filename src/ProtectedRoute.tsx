//ProtectedRoute varmistaa, että käyttäjä on oikealla dashboardilla. (Muutetaan vastaamaan jobtitleä)
//Logiikka käsitellään app.tsx:ssä

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./utils/auth-context";
import { useEffect } from "react";

interface ProtectedRouteProps {
  element: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {

    //Jos käyttäjä ei ole kirjautunut, niin ohjataan käyttäjä takaisin login sivulle
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Elementti renderöidään vain, jos käyttäjä on kirjautunut
  return <>{isAuthenticated && element}</>;
};

export default ProtectedRoute;



