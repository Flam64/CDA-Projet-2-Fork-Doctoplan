export type Rdv = {
  id: string;
  doctor: {
    departement: {
      label: string;
    };
    firstname: string;
    lastname: string;
  };
  start_time: string;
};

export type PatientAppointment = {
  user_id: string;
  date: string;
  start: string;
  end: string;
  appointmentType: string;
  patient_id: string;
};
