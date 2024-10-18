import { PublicClientApplication, EventType, AuthenticationResult } from "@azure/msal-browser";
import { msalConfig } from "../authConfig";

export const msalInstance = new PublicClientApplication(msalConfig);


export const handleMsalEventCallback = (
    setUserEmail: (email: string) => void, 
    setIsAuthenticated: (isAuthenticated: boolean) => void
) => {
    const callbackId = msalInstance.addEventCallback((event) => {
        if (event.eventType === EventType.LOGIN_SUCCESS) {
            const account = (event.payload as AuthenticationResult).account;
            msalInstance.setActiveAccount(account);
            
            
            if (account?.username) {
                setUserEmail(account.username);
                setIsAuthenticated(true);
            }
        }
    });

    
    return callbackId;
};

