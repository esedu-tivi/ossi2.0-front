import { gql } from '@apollo/client';

export const CREATE_PROJECT_TAG = gql`
    mutation CreateProjectTag($name: String!) {
        createProjectTag(name: $name) {
            message
            status
            success
            tag {
                id
                name
            }
        }
    }
`;
