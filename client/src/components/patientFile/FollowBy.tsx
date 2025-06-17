import ModuleList from '../ModuleList';
import inputPersonnal from '@/types/numPatient.type';
import { useGetDoctorByPatientQuery } from '@/types/graphql-generated';
import { Link } from 'react-router-dom';

type DoctorByPatient = {
  doctor: {
    id: string;
    firstname: string;
    lastname: string;
    departement: {
      label: string;
    };
  };
};
let dataDoctor: DoctorByPatient[] = [];

export default function FollowBy({ patientNum }: inputPersonnal) {
  const GetDoctorByPatientQuery = useGetDoctorByPatientQuery({
    variables: { patientId: patientNum },
  });

  if (GetDoctorByPatientQuery.loading) return <p>Loading...</p>;
  if (GetDoctorByPatientQuery.error) return <p>Error</p>;

  if (GetDoctorByPatientQuery.data) dataDoctor = GetDoctorByPatientQuery.data.getDoctorByPatient;

  return (
    <article className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-xl font-semibold mb-4">Suivi par :</h2>
      <ModuleList<DoctorByPatient>
        data={dataDoctor}
        getKey={item => item.doctor.id}
        renderItem={item => (
          <Link to={`/secretary/doctor/${item.doctor.id}/agenda`}>
            <span className="font-bold text-gray-800">
              {item.doctor.firstname} {item.doctor.lastname}
            </span>
            <span className="text-gray-600">- {item.doctor.departement.label} - </span>
          </Link>
        )}
      />
    </article>
  );
}
