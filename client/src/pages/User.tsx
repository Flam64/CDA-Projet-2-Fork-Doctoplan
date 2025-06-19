import Pagination from '@/components/logs/Pagination';
import StatusModal from '@/components/StatusModal';
import { useChangeStatusStatusMutation, useGetAllUsersQuery } from '@/types/graphql-generated';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import searchIcon from '@/assets/search-icon.svg';

export default function User() {
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const usersPerPage = 5;

  const [updateStatus] = useChangeStatusStatusMutation();
  const { loading, error, data, refetch } = useGetAllUsersQuery({
    variables: {
      page: currentPage,
      limit: usersPerPage,
      search: searchUser,
    },
  });
  if (error) return <p>Error</p>;
  const users = data?.getAllUsers?.users || [];
  const totalUsers = data?.getAllUsers?.total || 0;

  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const handlePaginatation = (pageNumber: number) => setCurrentPage(pageNumber);

  const updateUserStatus = async () => {
    if (userId) await updateStatus({ variables: { changeStatusStatusId: userId } });
    refetch();
    setShowStatusModal(false);
  };
  const handleSearchBar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    if (e.target.value.length === 0 || e.target.value.length >= 2) {
      setSearchUser(e.target.value);
      setCurrentPage(0);
    }
  };
  return (
    <main className="container  mx-auto pt-4 pr-12 pl-12 pb-12 flex overflow-hidden flex-col gap-4">
      <header className="flex items-center mb-4">
        <h2 className="text-xl mr-5 font-semibold text-gray-700">Tableau de bord administrateur</h2>
        <Link className="bg-blue text-white px-4 py-2 rounded-md" to={'create'}>
          Nouvel utilistateur
        </Link>
      </header>
      <section className="bg-bgBodyColor p-4">
        <div className="bg-white m-4 w-2/5 relative border border-borderColor rounded-full">
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchBar}
            className="w-full px-10 py-3 border border-borderColor rounded-full focus:outline-none focus:ring-1 focus:ring-borderColor"
            placeholder="Chercher un utilisateur"
          />
          <img
            src={searchIcon}
            alt="search icon"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
          />
        </div>

        {loading && <p className="text-center">Chargement...</p>}
        <div className="space-y-4">
          {users.map(({ id, firstname, lastname, email, status, departement }) => (
            <section
              key={id}
              className="bg-white border border-borderColor rounded-md p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <p className="text-sm">
                {firstname} {lastname} - {email} - {departement.label}
              </p>
              <div className="flex gap-2 w-full md:w-auto">
                <Link
                  to={`${id}/update`}
                  className="text-white px-4 py-2 rounded text-sm w-full md:w-28 bg-bgEdit text-center"
                >
                  Modifier
                </Link>
                <Link
                  to={`${id}/planning`}
                  className="text-white px-4 py-2 rounded text-sm w-full md:w-28 bg-blue text-center"
                >
                  Planning
                </Link>
                <button
                  className={`text-white px-4 py-2 rounded text-sm w-full md:w-28 ${
                    status === 'active' ? 'bg-bgActiveStatus' : 'bg-bgInActiveStatus'
                  }`}
                  onClick={() => {
                    setUserId(id);
                    setShowStatusModal(true);
                  }}
                >
                  {status}
                </button>
              </div>
              {userId === id && showStatusModal && (
                <StatusModal
                  data={{
                    id,
                    title: `Êtes-vous sûr de vouloir changer le statut de cet utilisateur : ${firstname} ${lastname}`,
                  }}
                  onClose={() => setShowStatusModal(false)}
                  updateStatus={updateUserStatus}
                />
              )}
            </section>
          ))}
        </div>
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePaginatation}
            totalItems={totalUsers}
            pageSize={usersPerPage}
          />
        </div>
      </section>
    </main>
  );
}
