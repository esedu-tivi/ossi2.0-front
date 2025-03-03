import { gql } from '@apollo/client';

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($updateProjectId: ID!, $project: UpdateProjectInput!) {
    updateProject(id: $updateProjectId, project: $project) {
      id
      name
      description
      duration
      isActive
      materials
      competenceRequirements {
        description
        id
      }
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