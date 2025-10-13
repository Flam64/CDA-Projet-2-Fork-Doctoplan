import AgendaWithNavigator from '@/components/calendar/AgendaWithNavigator';
import { CreateAppointmentContext } from '@/contexts/createappointment.context';

export default function SecretaryDashboard() {
  return (
    <>
      <CreateAppointmentContext>
        <AgendaWithNavigator />
      </CreateAppointmentContext>
    </>
  );
}
