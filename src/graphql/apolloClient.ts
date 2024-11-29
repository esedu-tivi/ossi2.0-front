import { ApolloClient, InMemoryCache, HttpLink, } from '@apollo/client';


const httpLink = new HttpLink({
  uri: 'http://localhost:3000/graphql', 
  fetch: (uri, options = {}) => {
    const token = sessionStorage.getItem("mutatedToken"); 

    
    options.headers = {
      ...options.headers,
      // This line 14 is commented out because the token doesnt have all 
      //the attributes needed on the server side
      // Authorization: token ? `Bearer ${token}` : "", 
    };

    return fetch(uri, options);
  },
});


export const client = new ApolloClient({
  link: httpLink, 
  cache: new InMemoryCache(), 
});


