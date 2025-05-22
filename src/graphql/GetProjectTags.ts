import { gql } from '@apollo/client';

export const GET_PROJECT_TAGS = gql`
    query ProjectTags {
         projectTags {
            message
            status
            success
            projectTags {
                name
                id
            }
        }
    }
`;
