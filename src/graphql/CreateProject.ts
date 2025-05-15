import { gql } from '@apollo/client';

export const CREATE_PROJECT = gql`
  mutation CreateProject($project: CreateProjectInput!) {
    createProject(project: $project) {
      status
      success
      message
      project {
        id
        name
        description
        materials
        duration
        includedInQualificationUnitParts {
          id
          name
        }
        tags {
          id
          name
        }
        competenceRequirements {
          id
          description
        }
        isActive
      }
    }
  }
`;
