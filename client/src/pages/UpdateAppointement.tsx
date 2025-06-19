import { useParams } from 'react-router-dom';
import { CreateAppointmentContext } from '@/contexts/createappointment.context';
import Calendar from '@/components/calendar/Calendar';
import FormAppointmentUpdate from '@/components/appointement/FormAppointmentUpdate';
import DocSecretaryAppointment from '@/components/appointement/DocSecretaryAppointment';
import { useGetAppointmentsByIdQuery } from '@/types/graphql-generated';
import { Patient } from '@/types/patient.type';
import { PatientAppointment } from '@/types/appointement.type';
import calendarClock from '@/assets/calendar-clock.svg';

export default function UpdateAppointement() {
  const { id } = useParams();

  const {
    data: dataAppointment,
    error: errorAppointment,
    loading: loadingAppointment,
  } = useGetAppointmentsByIdQuery({
    variables: { id: +(id || 0) },
  });

  if (errorAppointment) return;
  if (loadingAppointment) return;
  if (!dataAppointment) return;

  const startDateObj = new Date(dataAppointment.getAppointmentsById.start_time);
  // Format HH:MM pour l'heure de début
  const startTime = startDateObj.toTimeString().slice(0, 5);
  // Calculer l'heure de fin en ajoutant la durée (en minutes)
  const endDateObj = new Date(
    startDateObj.getTime() + dataAppointment.getAppointmentsById.duration * 60000,
  );
  const endTime = endDateObj.toTimeString().slice(0, 5);
  // Format YYYY-MM-DD pour la date
  const date = startDateObj.toISOString().slice(0, 10);
  const selectedAppointment: PatientAppointment = {
    appointmentType: dataAppointment.getAppointmentsById.appointmentType.id,
    date: date,
    end: endTime,
    patient_id: dataAppointment.getAppointmentsById.patient.id,
    start: startTime,
    user_id: dataAppointment.getAppointmentsById.doctor.id,
  };

  const selectedPatient: Patient = {
    id: dataAppointment?.getAppointmentsById.patient.id || '0',
    firstname: dataAppointment?.getAppointmentsById.patient.firstname || '',
    lastname: dataAppointment?.getAppointmentsById.patient.lastname || '',
    social_number: dataAppointment?.getAppointmentsById.patient.social_number || '',
  };

  return (
    <>
      <CreateAppointmentContext>
        <div className="flex flex-col w-full xl:w-3/4 mb-2 px-4 xl:px-0">
          <section className="flex flex-col gap-4 self-start">
            <div className="flex gap-4 items-center">
              <img src={calendarClock} alt="icone de creation de rendez-vous" className="w-6 h-6" />
              <h2 className="text-lg xl:text-xl font-semibold">Modifier un rendez-vous</h2>
            </div>
          </section>
        </div>

        <section className="bg-bgBodyColor w-full xl:w-3/4 p-4 sm:p-6 md:p-12 lg:p-16 rounded-sm shadow-md border border-borderColor flex flex-col xl:flex-row justify-center gap-8 xl:gap-12 mx-4 xl:mx-auto">
          {/* Agenda + Notes */}
          <div className="flex flex-col gap-4 w-full xl:w-auto flex-none items-center xl:items-start">
            <aside className="bg-white border p-6 rounded-md border-gray-300 flex items-center justify-center w-[300px] h-[300px]">
              <Calendar />
            </aside>
            <div className="bg-white border p-2 rounded-md border-gray-300 w-[300px]">
              <DocSecretaryAppointment idAppointment={id || ''} />
            </div>
          </div>

          {/* Formulaire */}
          <div className="w-full xl:w-2/3">
            <FormAppointmentUpdate
              idAppointment={id || ''}
              selectedPatient={selectedPatient}
              selectedAppointment={selectedAppointment}
              selectedDepartment={dataAppointment?.getAppointmentsById.departement.id}
            />
          </div>
        </section>
      </CreateAppointmentContext>
    </>
  );
}
