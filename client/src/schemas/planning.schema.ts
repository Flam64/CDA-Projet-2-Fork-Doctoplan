import { gql } from '@apollo/client';

export const CREATE_PLANNING = gql`
  mutation createDoctorPlanning(
    $createDoctorPlanningId: String!
    $input: CreatePeriodOfPlanningInput!
  ) {
    createDoctorPlanning(id: $createDoctorPlanningId, input: $input) {
      start
      end
      monday_start
      monday_end
      tuesday_start
      tuesday_end
      wednesday_start
      wednesday_end
      thursday_start
      thursday_end
      friday_start
      friday_end
      saturday_start
      saturday_end
      sunday_start
      sunday_end
    }
  }
`;
