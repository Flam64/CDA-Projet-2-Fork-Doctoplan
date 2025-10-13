import { CreateAppointmentContext } from '@/contexts/createappointment.context';
import NewAppointementByDoctorContent from '@/components/appointement/NewAppointementByDoctorContent';

export default function NewAppointementByDoctor() {
  return (
    <CreateAppointmentContext>
      <NewAppointementByDoctorContent />
    </CreateAppointmentContext>
  );
}
