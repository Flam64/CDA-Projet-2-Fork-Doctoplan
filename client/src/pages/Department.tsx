import {
  useChangeDepartmentStatusMutation,
  useGetAllDepartementsWithPaginationQuery,
} from '@/types/graphql-generated';
import { useState } from 'react';
import CreateDepartmentModal from '../components/department/CreateDepartmentModal';
import StatusModal from '@/components/StatusModal';
import Pagination from '@/components/logs/Pagination';
import searchIcon from '@/assets/search-icon.svg';
import { FocusTrapModal } from '@/utils/modal';

export default function Department() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [updateStatus] = useChangeDepartmentStatusMutation();
  const [currentPage, setCurrentPage] = useState(0);
  const depPerPage = 5;
  const { loading, error, data, refetch } = useGetAllDepartementsWithPaginationQuery({
    variables: {
      page: currentPage,
      limit: depPerPage,
      search: searchTerm,
    },
  });

  const filteredDepartments = data?.getAllDepartementsWithPagination.departements;
  const totalDepartments = data?.getAllDepartementsWithPagination?.total || 0;
  const totalPages = Math.ceil(totalDepartments / depPerPage);
  const handlePaginatation = (pageNumber: number) => setCurrentPage(pageNumber);

  const updateDepartmentStatus = async () => {
    if (departmentId) {
      await updateStatus({ variables: { changeDepartmentStatusId: departmentId } });
      refetch();
      setShowStatusModal(false);
    }
  };
  return (
    <>
      <div className="container  mx-auto pt-4 pr-12 pl-12 pb-12 flex flex-col gap-4">
        <div className="flex items-center mb-4">
          <h2 className="text-xl mr-5 font-semibold text-gray-700">Gestion des services</h2>
          {error && <p>Erro</p>}
          {loading && <p>Loading</p>}
          <>
            <button
              className="bg-blue text-white px-4 py-2 rounded-md"
              onClick={() => setShowCreateModal(true)}
            >
              Nouveau service
            </button>
            {showCreateModal && (
              <div className="fixed inset-0 z-50 flex justify-center  items-center bg-bgModalColor backdrop-blur-xs">
                <FocusTrapModal>
                  <CreateDepartmentModal
                    id={departmentId}
                    onClose={() => {
                      setShowCreateModal(false);
                      setDepartmentId(null);
                    }}
                  />
                </FocusTrapModal>
              </div>
            )}
          </>
        </div>
        <div className="bg-bgBodyColor mb-4">
          <div className="bg-white m-4 w-2/5 relative border border-borderColor rounded-full">
            <label htmlFor="dep" className="sr-only">
              Chercher un service
            </label>
            <input
              type="text"
              id="dep"
              className="w-full px-10 py-3 border border-borderColor rounded-full focus:outline-none focus:ring-1 focus:ring-borderColor"
              placeholder="Chercher un service"
              onChange={e => setSearchTerm(e.target.value)}
              aria-label="Chercher un service"
            />
            <img
              src={searchIcon}
              alt=""
              role="presentation"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
          </div>
          <div className="space-y-4">
            {filteredDepartments?.map(department => (
              <div
                key={department.id}
                className="bg-white border border-borderColor rounded-md p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <p>
                  {department.label} - Bat {department.building} - Aile {department.wing} -{' '}
                  {department.level}
                </p>
                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    className={`text-white px-4 py-2 rounded text-sm w-full md:w-28 bg-bgEdit text-center`}
                    onClick={() => {
                      setShowCreateModal(true);
                      setDepartmentId(department.id);
                    }}
                  >
                    Modifier
                  </button>
                  <button
                    className={`text-white px-4 py-2 rounded text-sm w-full md:w-28 ${
                      department.status === 'active' ? 'bg-bgActiveStatus' : 'bg-bgInActiveStatus'
                    }`}
                    onClick={() => {
                      setShowStatusModal(true);
                      setDepartmentId(department.id);
                    }}
                  >
                    {department.status}
                  </button>
                </div>
                {departmentId === department.id && showStatusModal && (
                  <StatusModal
                    data={{
                      id: department.id,
                      title: `Etes-vous sur de vouloir changer le status de ce service : ${department.label}`,
                    }}
                    onClose={() => setShowStatusModal(false)}
                    updateStatus={updateDepartmentStatus}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePaginatation}
          totalItems={totalDepartments}
          pageSize={depPerPage}
        />
      </div>
    </>
  );
}
