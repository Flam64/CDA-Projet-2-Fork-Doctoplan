import UpdatePatient from '../components/patientFile/UpdatePatient';
import NoteDoctor from '@/components/doctor/NoteDoctor';
import { useGetAppointmentsByIdQuery } from '@/types/graphql-generated';
import { useParams } from 'react-router-dom';

export default function UpdateAppointementDoctor() {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full items-start">
      {/* Colonne 1 */}
      <section className="p-4 md:row-span-2">
        <div className="bg-white rounded-2xl p-4">
          <UpdatePatient patientNum={dataAppointment.getAppointmentsById.patient.id} />
        </div>{' '}
        {/* TODO: make a PatientInformations component instead of this div */}
      </section>

      {/* Colonne 2 */}
      <div className="grid lg:col-span-2 lg:grid-cols-2">
        {/* Section 2 */}
        <section className="p-4">
          <NoteDoctor patientNum={dataAppointment.getAppointmentsById.patient.id} />
        </section>
      </div>
    </div>
  );
}
