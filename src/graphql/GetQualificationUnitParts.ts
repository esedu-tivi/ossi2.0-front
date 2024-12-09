//Teemojen haku tietokannasta
import { gql } from '@apollo/client';

export const GET_QUALIFICATION_UNIT_PARTS = gql`
    query GetQualificationUnitParts {
       parts {
    id
    name
  }
    }
    `;