import { LogLevel } from '@azure/msal-browser';

const clientId = import.meta.env.VITE_CLIENT_ID;
const tenantId = import.meta.env.VITE_TENANT_ID;
const redirectUri = import.meta.env.VITE_REDIRECT_URI;
const postLogoutRedirectUri = import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI;

if (!clientId || !tenantId || !redirectUri || !postLogoutRedirectUri) {
  throw new Error("Missing environment variables for MSAL configuration");
}

export const msalConfig = {
    auth: {
        clientId: clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`, 
        redirectUri: redirectUri, 
        postLogoutRedirectUri: postLogoutRedirectUri,
        navigateToLoginRequestUrl: true, // If "true", will navigate back to the original request location before processing the auth code response.
    },
    cache: {
        cacheLocation: 'sessionStorage', // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    },
    system: {
        loggerOptions: {
            loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    // case LogLevel.Verbose:
                    //     console.debug(message);
                    //     return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                    default:
                        break;
                }
            },
            piiLoggingEnables: false,
            logLevel: LogLevel.Info,
        },
    },
};

export const loginRequest = {
    scopes: ["User.Read" ,"profile", "openid"],
};

export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};