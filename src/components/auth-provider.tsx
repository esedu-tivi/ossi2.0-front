import { PublicClientApplication, EventType, AuthenticationResult } from "@azure/msal-browser";
import { msalConfig } from "../authConfig";
import { ReactNode, useEffect, useMemo } from "react";
import { MsalProvider } from "@azure/msal-react";

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    // Memoize msalInstance to prevent it from being recreated on every render
    const msalInstance = useMemo(() => new PublicClientApplication(msalConfig), []);

    useEffect(() => {
        const callbackId = msalInstance.addEventCallback((event) => {
            if (event.eventType === EventType.LOGIN_SUCCESS) {
                const account = (event.payload as AuthenticationResult).account;
                msalInstance.setActiveAccount(account);
            }
        });

        // Clean up the event callback when the component unmounts
        return () => {
            if (callbackId) {
                msalInstance.removeEventCallback(callbackId);
            }
        };
    }, [msalInstance]);

    return (
        <MsalProvider instance={msalInstance}>
            {children}
        </MsalProvider>
    );
};



