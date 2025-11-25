import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './components/auth-provider';
import { client } from './graphql/apolloClient';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfirmProvider } from "material-ui-confirm"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <BrowserRouter>
          <ConfirmProvider defaultOptions={{
            confirmationText: "Ok",
            cancellationText: "Peruuta"
          }}>
            <App />
          </ConfirmProvider>
        </BrowserRouter >
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>
);


