import { useState } from 'react';
import inputPersonnal from '@/types/numPatient.type';
import CreateUploadModal from '@/components/modals/CreateUploadModal';
import { useGetDocumentByIdQuery } from '@/types/graphql-generated';
import { Link } from 'react-router-dom';
import { FocusTrapModal } from '@/utils/modal';

export default function AdminDocs({ patientNum }: inputPersonnal) {
  const [showAddDocPatientModal, setshowAddDocPatientModal] = useState(false);
  const GetDocumentByIdQuery = useGetDocumentByIdQuery({
    variables: { patientId: patientNum },
  });

  if (GetDocumentByIdQuery.loading || !GetDocumentByIdQuery.data?.getDocumentByID) return null;

  return (
    <article className="bg-white rounded-2xl shadow p-4 relative">
      <h2 className="text-xl font-semibold mb-4">Documents administratifs</h2>
      <button
        type="button"
        className="absolute right-6 top-4 px-3 py-1 bg-blue text-white cursor-pointer rounded-md"
        onClick={() => setshowAddDocPatientModal(true)}
        aria-label="Ajouter un document administratif"
      >
        +
      </button>
      {showAddDocPatientModal && (
        <div className="fixed inset-0 z-50 flex justify-center  items-center bg-bgModalColor backdrop-blur-xs">
          <FocusTrapModal>
            <CreateUploadModal
              id={patientNum}
              onClose={() => {
                setshowAddDocPatientModal(false);
              }}
              GetDocumentByIdQuery={GetDocumentByIdQuery}
              route={'/upload/patient-file'}
              typedoc={'patient'}
            />
          </FocusTrapModal>
        </div>
      )}
      <ul className="space-y-2">
        {GetDocumentByIdQuery.data.getDocumentByID.map(doc => (
          <li key={doc.id} className="flex justify-between">
            <span>
              <Link
                to={'/upload/public/patient/' + doc.url}
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
