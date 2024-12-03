import { gql } from '@apollo/client';

export const CREATE_PROJECT_TAG = gql`
    mutation CreateProjectTag($name: String!) {
        createProjectTag(name: $name) {
            name
        }
    }
`;
