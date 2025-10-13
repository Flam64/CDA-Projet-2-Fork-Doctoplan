export type Appointment = {
  id: string;
  patient_name: string;
  start_time: string;
  duration?: string;
  end_time?: string;
  statut: string;
  appointment_type: string;
  doctor_id: string;
};
