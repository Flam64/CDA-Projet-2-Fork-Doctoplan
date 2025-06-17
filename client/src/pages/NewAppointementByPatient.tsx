import { useParams } from 'react-router-dom';
import { CreateAppointmentContext } from '@/contexts/createappointment.context';
import Calendar from '@/components/calendar/Calendar';
import FormAppointmentPatient from '@/components/appointement/FormAppointmentPatient';
import calendarClock from '@/assets/calendar-clock.svg';

export default function NewAppointementByPatient() {
  const { id } = useParams();
  if (id === undefined) {
    return <div className="flex items-center justify-center h-screen">Patient not found</div>;
  }
  return (
    <>
      <CreateAppointmentContext>
        <div className="flex flex-col w-3/4 mb-2">
          <section className="flex flex-col gap-4 self-start">
            <div className="flex gap-4">
              <img src={calendarClock} alt="icone de creation de rendez-vous" />
              <h2>Creer un rendez-vous</h2>
            </div>
          </section>
        </div>
        <section className="bg-bgBodyColor sm:w-full md:w-3/4 p-4 sm:p-6 md:p-12 lg:p-24 rounded-sm shadow-md border-borderColor flex flex-col md:flex-row justify-center gap-10 md:gap-45">
          <aside className="bg-white border-1 p-7 rounded-md border-gray-300 max-h-80">
            <Calendar />
          </aside>
          <FormAppointmentPatient patient_id={id} />
        </section>
      </CreateAppointmentContext>
    </>
  );
}
