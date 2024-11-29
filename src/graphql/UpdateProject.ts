import { gql } from '@apollo/client';

export const UPDATE_PROJECT = gql`
  mutation Mutation($updateProjectId: ID!, $project: UpdateProjectInput!) {
    updateProject(id: $updateProjectId, project: $project) {
      id
      name
      description
      duration
      materials
      isActive
      includedInQualificationUnitParts {
        id
        name
      }
      tags {
        id
        name
      }
    }
  }
`;