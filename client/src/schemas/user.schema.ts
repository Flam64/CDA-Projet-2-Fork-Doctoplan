import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query GetAllUsers($page: Int, $limit: Int, $search: String) {
    getAllUsers(page: $page, limit: $limit, search: $search) {
      users {
        id
        email
        role
        firstname
        lastname
        status
        activationDate
        gender
        tel
        departement {
          id
          label
        }
      }
      total
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUserById($id: String!) {
    getUserById(id: $id) {
      id
      email
      role
      firstname
      lastname
      tel
      gender
      status
      activationDate
      departement {
        id
        label
      }
      plannings {
        id
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
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input)
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($input: CreateUserInput!, $updateUserId: String!) {
    updateUser(input: $input, id: $updateUserId)
  }
`;

export const GET_DOCTORS_BY_DEPARTEMENT = gql`
  query GetDoctorsByDepartement($id: Float!) {
    getDoctorsByDepartement(id: $id) {
      id
      email
      role
      firstname
      lastname
      status
      departement {
        label
      }
    }
  }
`;

export const SEARCH_DOCTORS = gql`
  query SearchDoctors($query: String!) {
    searchDoctors(query: $query) {
      id
      firstname
      lastname
      departement {
        id
        label
      }
    }
  }
`;

export const SEND_RESET_PASSWORD_BY_MAIL = gql`
  mutation SendResetPassword($email: sendEmailInput!) {
    sendResetPassword(email: $email)
  }
`;

export const UPDATE_USER_STATUS = gql`
  mutation ChangeStatusStatus($changeStatusStatusId: String!) {
    changeStatusStatus(id: $changeStatusStatusId)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input)
  }
`;
