import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || '/graphql';

const httpLink = new HttpLink({
    uri: graphqlUrl,
    fetch: (uri, options = {}) => {
        const token = sessionStorage.getItem('mutatedToken');

        options.headers = {
            ...options.headers,
            Authorization: token ? token : '',
        };

        return fetch(uri, options);
    },
});

export const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache({
        typePolicies: {
            MeResponse: {
                keyFields: false,
            },
        },
    }),
});
