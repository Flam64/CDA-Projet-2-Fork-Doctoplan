import ModuleList from '../ModuleList';
import { useGetLastAppointmentsByPatientQuery } from '@/types/graphql-generated';
import { Rdv } from '@/types/appointement.type';
import { Link } from 'react-router-dom';

let dataLastRdv: Rdv[] = [];
type LastAllRdvProps = {
  patientNum: string;
};

export default function LastAllRdv({ patientNum }: LastAllRdvProps) {
  const GetLastAppointmentsByPatient = useGetLastAppointmentsByPatientQuery({
    variables: { patientId: patientNum },
  });

  if (GetLastAppointmentsByPatient.loading) return <p>Loading...</p>;
  if (GetLastAppointmentsByPatient.error) return <p>Error</p>;

  if (GetLastAppointmentsByPatient.data)
    dataLastRdv = GetLastAppointmentsByPatient.data.getLastAppointmentsByPatient;

  return (
    <article className="bg-white rounded-2xl shadow p-4 mb-4">
      <h2 className="text-xl font-semibold mb-4">Derniers rendez-vous</h2>
      <ModuleList<Rdv>
        data={dataLastRdv}
        getKey={item => item.id}
        renderItem={item => (
          <>
            <Link to={`/doctor/appointment/${item.id}/update`}>
              <span className="font-bold text-gray-800">
                {item.doctor.firstname} {item.doctor.lastname}
              </span>
              <span className="text-gray-600">
                - {item.doctor.departement.label} -{' '}
                {new Date(item.start_time).toLocaleDateString('fr-FR')} -{' '}
                {new Date(item.start_time).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </Link>
          </>
        )}
      />
    </article>
  );
}
