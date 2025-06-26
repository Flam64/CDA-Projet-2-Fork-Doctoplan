import UpdatePatient from '../components/patientFile/UpdatePatient';
import NoteDoctor from '@/components/doctor/NoteDoctor';
import { useGetAppointmentsByIdQuery } from '@/types/graphql-generated';
import { useParams } from 'react-router-dom';
import BiometricDataComponent from '@/components/appointement/BiometricData';
import AdministrativeDoc from '@/components/doctor/AdministrativeDoc';
import LastAllRdv from '@/components/doctor/LastAllRdv';

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
    <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4 gap-6 w-full items-start">
      {/* Colonne 1 */}
      <section className="p-4 md:row-span-2 grid-cols-1 col-span-1 2xl:col-span-1">
        <div className="bg-white rounded-2xl p-4">
          <UpdatePatient patientNum={dataAppointment.getAppointmentsById.patient.id} />
        </div>
        <div className="mt-4">
          <AdministrativeDoc appointmentId={+(id || '0')} />
        </div>
        {/* TODO: make a PatientInformations component instead of this div */}
      </section>

      {/* Colonne 2 */}
      <div className="grid 2xl:col-span-3 col-span-1">
        {/* Section 2 */}
        <section className="p-4">
          <NoteDoctor
            appointmentId={+(id || '0')}
            doctorId={+dataAppointment.getAppointmentsById.doctor.id}
          />
        </section>
      </div>
      <section className="p-4 lg:col-span-2">
        <BiometricDataComponent />
      </section>
      <section className="p-4 lg:col-span-1">
        <LastAllRdv patientNum={dataAppointment.getAppointmentsById.patient.id} />
      </section>
    </div>
  );
}
