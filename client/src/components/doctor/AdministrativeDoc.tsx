import { useGetDocumentByIdAppSecQuery } from '@/types/graphql-generated';
import { Link } from 'react-router-dom';

type AdministrativeDocProps = {
  appointmentId: number;
};

export default function AdministrativeDoc({ appointmentId }: AdministrativeDocProps) {
  const GetDocumentByIdQuery = useGetDocumentByIdAppSecQuery({
    variables: { appointmentId: appointmentId.toString() },
  });

  if (GetDocumentByIdQuery.loading || !GetDocumentByIdQuery.data?.getDocumentByIDAppSec)
    return null;

  return (
    <article className="bg-white rounded-2xl shadow p-4 relative">
      <h2 className="text-xl font-semibold mb-4">Documents administratifs</h2>
      <ul className="space-y-2">
        {GetDocumentByIdQuery.data.getDocumentByIDAppSec.map(doc => (
          <li key={doc.id} className="flex justify-between">
            <span>
              <Link
                to={'/upload/public/appointmentSecretary/' + doc.url}
                target="_blank"
                className="block p-2 border-b last:border-b-0 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {doc.name} - {doc.docType.name} -{' '}
                {new Date(Number(doc.createdAt)).toLocaleDateString('fr-FR')}
              </Link>
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
