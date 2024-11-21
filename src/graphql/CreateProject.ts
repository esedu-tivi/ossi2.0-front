import { gql } from '@apollo/client';

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $project) {
      id
      name
      description
      materials
      osaamiset
      duration
      includedInParts
      tags
      isActive
    }
  }
`;