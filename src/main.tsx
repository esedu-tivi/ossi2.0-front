import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './components/auth-provider';
import { client } from './graphql/apolloClient';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfirmProvider } from "material-ui-confirm"
import AlertContainer from './components/AlertContainer';
import AlertContextProvider from './context/AlertContext';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <BrowserRouter>
          <ConfirmProvider defaultOptions={{
            confirmationText: "Ok",
            cancellationText: "Peruuta"
          }}>
            <AlertContextProvider>
              <AlertContainer />
              <App />
            </AlertContextProvider>
          </ConfirmProvider>
        </BrowserRouter >
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>
);


