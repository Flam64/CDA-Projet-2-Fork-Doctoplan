import AdminDocs from '../components/patientFile/AdminDocs';
import FollowBy from '../components/patientFile/FollowBy';
import LastRdv from '../components/patientFile/LastRdv';
import NextRdv from '../components/patientFile/NextRdv';
import UpdatePatient from '../components/patientFile/UpdatePatient';
import { useParams } from 'react-router-dom';

export default function PatientFileSecretary() {
  const { id } = useParams();
  if ((id && isNaN(parseInt(id))) || id === undefined) {
    return <div className="flex items-center justify-center h-screen">Patient not found</div>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full items-start">
      {/* Colonne 1 */}
      <section className="p-4 md:row-span-2">
        <div className="bg-white rounded-2xl p-4">
          <UpdatePatient patientNum={id} />
        </div>{' '}
        {/* TODO: make a PatientInformations component instead of this div */}
      </section>

      {/* Colonne 2 */}
      <div className="grid lg:col-span-2 lg:grid-cols-2">
        {/* Section 2 */}
        <section className="p-4">
          <NextRdv patientNum={id} />
          <AdminDocs patientNum={id} />
        </section>
        {/* Section 3 */}
        <section className="p-4">
          <LastRdv patientNum={id} />
          <FollowBy patientNum={id} />
        </section>
      </div>
    </div>
  );
}
