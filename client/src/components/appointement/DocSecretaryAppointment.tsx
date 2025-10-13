import { useGetDocumentByIdAppSecQuery } from '@/types/graphql-generated';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import CreateUploadModal from '@/components/modals/CreateUploadModal';
import { FocusTrapModal } from '@/utils/modal';

type DocSecretaryAppointmentProps = {
  idAppointment: string;
};

export default function DocSecretaryAppointment({ idAppointment }: DocSecretaryAppointmentProps) {
  const GetDocumentByIdQuery = useGetDocumentByIdAppSecQuery({
    variables: { appointmentId: idAppointment },
  });
  const [showAddDoc, setshowAddDoc] = useState(false);

  return (
    <>
      <article className="block bg-white p-5 relative">
        <h2>Documents</h2>
        <button
          type="button"
          className="absolute right-6 top-4 px-3 py-1 bg-blue text-white cursor-pointer rounded-md"
          onClick={() => setshowAddDoc(true)}
          aria-label="Ajouter Document"
        >
          +
        </button>
        {showAddDoc && (
          <div className="fixed inset-0 z-50 flex justify-center  items-center bg-bgModalColor backdrop-blur-xs">
            <FocusTrapModal>
              <CreateUploadModal
                id={idAppointment}
                onClose={() => {
                  setshowAddDoc(false);
                }}
                GetDocumentByIdQuery={GetDocumentByIdQuery}
                route={'/upload/appointment-sec-file'}
                typedoc={'appointment'}
              />
            </FocusTrapModal>
          </div>
        )}
        <ul className="space-y-2">
          {GetDocumentByIdQuery.data?.getDocumentByIDAppSec.map(docsec => (
            <li key={docsec.id} className="flex justify-between text-sm">
              <Link
                to={'/upload/public/appointmentSecretary/' + docsec.url}
                target="_blank"
                className="block p-2 border-b last:border-b-0 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {docsec.name} - {docsec.docType.name}
              </Link>
            </li>
          ))}
        </ul>
      </article>
    </>
  );
}
