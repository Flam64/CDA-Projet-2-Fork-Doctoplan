import { gql } from '@apollo/client';

export const CREATE_VACATION = gql`
  mutation CreateVacation($input: VacationInput!, $createVacationId: String!) {
    createVacation(input: $input, id: $createVacationId)
  }
`;

export const UPDATE_VACATION = gql`
  mutation UpdateVacation($input: VacationInput!, $doctorId: String!, $vacationId: String!) {
    updateVacation(input: $input, doctorId: $doctorId, vacationId: $vacationId)
  }
`;

export const GET_VACATION_BY_USER = gql`
  query GetVacationById($getVacationByIdId: String!) {
    getVacationById(id: $getVacationByIdId) {
      id
      start
      end
      user {
        id
        firstname
        lastname
      }
    }
  }
`;

export const DELETE_VACATION = gql`
  query DeleteVacation($deleteVacationId: String!) {
    deleteVacation(id: $deleteVacationId)
  }
`;
