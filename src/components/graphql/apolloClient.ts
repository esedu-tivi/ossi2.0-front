import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';


const httpLink = new HttpLink({
  uri: 'http://localhost:3000/graphql',
});


const authLink = new ApolloLink((operation, forward) => {
   
  const token = sessionStorage.getItem("mutatedToken");

  
  operation.setContext({
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  
  return forward(operation);
});


export const client = new ApolloClient({
  link: authLink.concat(httpLink), 
  cache: new InMemoryCache(),
});

