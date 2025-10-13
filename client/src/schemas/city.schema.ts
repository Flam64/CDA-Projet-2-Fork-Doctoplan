import { gql } from '@apollo/client';

export const CITY_QUERY_BYCP = gql`
  query GetCityByCP($zipCode: String!) {
    getCityByCP(zip_code: $zipCode) {
      id
      city
      zip_code
    }
  }
`;
