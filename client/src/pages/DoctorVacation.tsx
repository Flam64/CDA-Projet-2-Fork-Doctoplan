import StatusModal from '@/components/StatusModal';
import CreateVacationModal from '@/components/user/CreateVacationModal';
import { useAuth } from '@/hooks/useAuth';
import { useDeleteVacationLazyQuery, useGetVacationByIdQuery } from '@/types/graphql-generated';
import { FocusTrapModal } from '@/utils/modal';
import { useState } from 'react';

export default function DoctorVacation() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteVacationQuery] = useDeleteVacationLazyQuery();

  const [vacationId, setVacationId] = useState('');
  const { user } = useAuth();
  const { data, refetch } = useGetVacationByIdQuery({
    variables: { getVacationByIdId: user?.id || '' },
  });
  const vacationList = data?.getVacationById;
  const deleteVacation = async () => {
    if (vacationId) {
      await deleteVacationQuery({ variables: { deleteVacationId: vacationId } });
      refetch();
      setShowDeleteModal(false);
    }
  };

  return (
    <main className="container  mx-auto pt-4 pr-12 pl-12 pb-12 flex items-center flex-col gap-4">
      <button
        className="bg-blue text-white px-4 py-2 rounded-md"
        onClick={() => setShowCreateModal(true)}
      >
        Demander un congé
      </button>
      {vacationList && vacationList.length > 0 && (
        <div className="p-4 bg-white">
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>Début</th>
                <th>Fin</th>
              </tr>
            </thead>
            <tbody>
              {vacationList.map(vacation => {
                const start = new Date(vacation.start).toLocaleDateString();
                const end = new Date(vacation.end).toLocaleDateString();
                return (
                  <tr key={vacation.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold', width: '120px' }}>{start}</td>
                    <td style={{ padding: '8px', fontWeight: 'bold', width: '120px' }}>{end}</td>
                    <td>
                      <div className="flex gap-2 w-full md:w-auto">
                        <button
                          className={`text-white px-4 py-2 rounded text-sm w-full md:w-28 bg-bgEdit text-center`}
                          onClick={() => {
                            setShowCreateModal(true);
                            setVacationId(vacation.id);
                          }}
                        >
                          Modifier
                        </button>
                        <button
                          className={`text-white px-4 py-2 rounded text-sm w-full md:w-28 ${
                            start === 'active' ? 'bg-bgActiveStatus' : 'bg-bgInActiveStatus'
                          }`}
                          onClick={() => {
                            setShowDeleteModal(true);
                            setVacationId(vacation.id);
                          }}
                        >
                          Suprimmer
                        </button>
                        {vacationId === vacation.id && showDeleteModal && (
                          <StatusModal
                            data={{
                              id: vacation.id,
                              title: `Etes-vous sur de vouloir suprimmer ces dates : ${vacation.start} - ${vacation.end}`,
                            }}
                            onClose={() => setShowDeleteModal(false)}
                            updateStatus={deleteVacation}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex justify-center  items-center bg-bgModalColor backdrop-blur-xs">
          <FocusTrapModal>
            <CreateVacationModal
              onClose={() => {
                setShowCreateModal(false);
                setVacationId('');
              }}
              id={vacationId}
            />
          </FocusTrapModal>
        </div>
      )}
    </main>
  );
}
