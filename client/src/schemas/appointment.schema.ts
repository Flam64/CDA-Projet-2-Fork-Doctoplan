import { gql } from '@apollo/client';

export const GET_APPOINTEMENTS_BY_ID = gql`
  query GetAppointmentsById($id: Float!) {
    getAppointmentsById(Id: $id) {
      appointmentType {
        id
      }
      departement {
        id
        label
      }
      doctor {
        id
      }
      duration
      patient {
        id
        social_number
        firstname
        lastname
      }
      start_time
      status
    }
  }
`;

export const GET_APPOINTEMENTS_DOC_SECRETARY = gql`
  query GetDocumentByIDAppSec($appointmentId: String!) {
    getDocumentByIDAppSec(appointmentId: $appointmentId) {
      docType {
        id
        name
      }
      id
      name
      url
      createdAt
    }
  }
`;

export const GET_LAST_APPOINTEMENTS = gql`
  query GetLastAppointmentsByPatient($patientId: String!) {
    getLastAppointmentsByPatient(patientId: $patientId) {
      id
      doctor {
        departement {
          label
        }
        firstname
        lastname
      }
      start_time
    }
  }
`;

export const GET_NEXT_APPOINTEMENTS = gql`
  query GetNextAppointmentsByPatient($patientId: String!) {
    getNextAppointmentsByPatient(patientId: $patientId) {
      id
      doctor {
        departement {
          label
        }
        firstname
        lastname
      }
      start_time
    }
  }
`;

export const GET_DOCTOR_BY_PATIENT = gql`
  query GetDoctorByPatient($patientId: String!) {
    getDoctorByPatient(patientId: $patientId) {
      doctor {
        id
        firstname
        lastname
        departement {
          label
        }
      }
    }
  }
`;

export const GET_APPOINTMENTS_BY_DOCTOR_AND_DATE = gql`
  query GetAppointmentsByDoctorAndDate($doctorId: Float!, $date: String!) {
    getAppointmentsByDoctorAndDate(doctorId: $doctorId, date: $date) {
      id
      start_time
      duration
      status
      patient {
        id
        firstname
        lastname
      }
      doctor {
        id
        firstname
        lastname
      }
      appointmentType {
        id
        reason
      }
      departement {
        id
        label
      }
    }
  }
`;

export const CHECK_DOCTOR_DATE_APPOINTMENTS = gql`
  query CheckDoctorDateAppointments($dates: DatesInput!, $doctorId: Float!) {
    checkDoctorDateAppointments(dates: $dates, doctorId: $doctorId)
  }
`;

export const GET_DOCTOR_SLOT_BY_DPT = gql`
  query GetDoctorSlotByDepartement($date: String!, $departementId: Float!) {
    getDoctorSlotByDepartement(date: $date, departement_id: $departementId) {
      id
      debut_libre
      fin_libre
      firstname
      jour
      lastname
      user_id
    }
  }
`;

export const MUTATION_CREATE_APPOINTMENT = gql`
  mutation createAppointment($appointmentInput: AppointmentCreateInput!) {
    createAppointment(appointmentInput: $appointmentInput) {
      id
      start_time
      patient {
        email
        firstname
        lastname
      }
      doctor {
        firstname
        lastname
      }
    }
  }
`;

export const MUTATION_UPDATE_APPOINTMENT = gql`
  mutation UpdateAppointment(
    $updateAppointmentId: String!
    $appointmentInput: AppointmentCreateInput!
  ) {
    updateAppointment(id: $updateAppointmentId, appointmentInput: $appointmentInput) {
      id
    }
  }
`;

export const QUERY_APPOINTMENT_NOTE = gql`
  query GetAppointmentNoteByID($appointmentId: String!) {
    getAppointmentNoteByID(appointmentId: $appointmentId) {
      description
      id
      createdAt
      appointmentDocDocteur {
        id
        name
        url
        docType {
          id
          name
        }
      }
    }
  }
`;

export const MUTATION_APPOINTMENT_NOTE = gql`
  mutation addNoteAppointment($appointmentId: Float!, $note: AppointmentNoteInput!) {
    addNoteAppointment(appointmentId: $appointmentId, note: $note) {
      id
    }
  }
`;

export const GET_SINGLE_NOTE = gql`
  query GetSingleNoteByID($noteId: String!) {
    getSingleNoteByID(noteId: $noteId) {
      id
      description
      createdAt
      appointmentDocDocteur {
        id
        name
        url
        docType {
          name
        }
      }
    }
  }
`;
