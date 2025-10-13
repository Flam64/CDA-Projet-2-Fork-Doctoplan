import { gql } from '@apollo/client';

export const GET_APPOINTMENT_TYPES = gql`
  query GetAppointmentTypes {
    getAppointmentTypes {
      id
      reason
    }
  }
`;
