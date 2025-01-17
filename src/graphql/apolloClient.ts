import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const httpLink = new HttpLink({
    uri: 'http://localhost:3000/graphql',
    fetch: (uri, options = {}) => {
        const token = sessionStorage.getItem('mutatedToken');
        options.headers = {
            ...options.headers,
            Authorization: token ? token : '',
        };
        return fetch(uri, options);
    },
});

const wsLink = new GraphQLWsLink(createClient({
    url: 'ws://localhost:3002/graphql',
    connectionParams: {
        Authorization: sessionStorage.getItem('mutatedToken'),
    },
}));

// Split links based on operation type
const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
    },
    wsLink,
    httpLink
);

export const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
});
