import { gql } from '@apollo/client';

export const DEPARTMENT = gql`
  query GetDepartements {
    getDepartements {
      id
      label
      building
      wing
      level
      status
    }
  }
`;

export const GET_DEPARTMENT_PAGINATION = gql`
  query GetAllDepartementsWithPagination($search: String, $page: Int, $limit: Int) {
    getAllDepartementsWithPagination(search: $search, page: $page, limit: $limit) {
      total
      departements {
        id
        label
        building
        wing
        level
        status
      }
    }
  }
`;

export const CREATE_DEPARTMENT = gql`
  mutation CreateDepartement($data: DepartementInput!) {
    createDepartement(data: $data)
  }
`;

export const UPDATE_DEPARTMENT_STATUS = gql`
  mutation ChangeDepartmentStatus($changeDepartmentStatusId: String!) {
    changeDepartmentStatus(id: $changeDepartmentStatusId)
  }
`;

export const UPDATE_DEPARTMENT = gql`
  mutation UpdateDepartment($data: DepartementInput!, $updateDepartmentId: String!) {
    updateDepartment(data: $data, id: $updateDepartmentId)
  }
`;
