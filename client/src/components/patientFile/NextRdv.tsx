import { useNavigate } from 'react-router-dom';
import { useGetNextAppointmentsByPatientQuery } from '@/types/graphql-generated';
import ModuleList from '../ModuleList';
import inputPersonnal from '@/types/numPatient.type';
import { Rdv } from '@/types/appointement.type';
import { useEffect } from 'react';

let dataNextRdv: Rdv[] = [];

export default function NextRdv({ patientNum }: inputPersonnal) {
  const GetNextAppointmentsByPatient = useGetNextAppointmentsByPatientQuery({
    variables: { patientId: patientNum },
  });
  const navigate = useNavigate();

  useEffect(() => {
    GetNextAppointmentsByPatient.refetch();
  }, [GetNextAppointmentsByPatient]);

  if (GetNextAppointmentsByPatient.loading) return <p>Loading...</p>;
  if (GetNextAppointmentsByPatient.error) return <p>Error</p>;

  if (GetNextAppointmentsByPatient.data)
    dataNextRdv = GetNextAppointmentsByPatient.data.getNextAppointmentsByPatient;

  return (
    <article className="bg-white rounded-2xl shadow p-4 mb-4 relative">
      <h2 className="text-xl font-semibold mb-4">
        Prochains rendez-vous
        <button
          type="button"
          className="absolute right-6 top-4 px-3 py-1 bg-blue text-white cursor-pointer rounded-md"
          aria-label="Ajouter un document administratif"
          onClick={() => navigate('/secretary/patient/' + patientNum + '/appointment/create')}
        >
          +
        </button>
      </h2>
      <ModuleList<Rdv>
        data={dataNextRdv}
        getKey={item => item.id}
        renderItem={item => (
          <>
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
          </>
        )}
      />
    </article>
  );
}
