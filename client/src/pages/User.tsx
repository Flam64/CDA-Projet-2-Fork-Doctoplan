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
  const usersPerPage = 8;

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
    <main className="container  mx-auto pt-4 pr-12 pl-12 pb-12 flex overflow-hidden flex-col gap-4 h-screen">
      <header className="flex items-center mb-4">
        <h2 className="text-xl mr-5 font-semibold text-gray-700">Tableau de bord administrateur</h2>
        <Link className="bg-blue text-white px-4 py-2 rounded-md" to={'/admin/users/create'}>
          Nouvel utilistateur
        </Link>
      </header>
      <section className="bg-bgBodyColor items-center mb-4 h-full overflow-y-auto">
        <div className="bg-white m-4 w-2/5 relative border border-borderColor rounded-full">
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchBar}
            className="w-full px-10 py-3 border border-borderColor rounded-full focus:outline-none focus:ring-1 focus:ring-borderColor"
            placeholder="Chercher un utilistateur"
          />
          <img
            src={searchIcon}
            alt="search icon"
            className="absolute right-3 top-1/2 -translate-y-1/2"
          />
        </div>
        {loading && <p>loading</p>}
        {users.map(({ id, firstname, lastname, email, status, departement }) => (
          <section
            key={id}
            className="flex px-3 py-3 m-4 bg-white border border-borderColor rounded-sm justify-between"
          >
            <p className="mt-auto mb-auto">
              {firstname} {lastname} - {email} - {departement.label}
            </p>
            <button
              onClick={() => {
                setShowStatusModal(true);
                setUserId(id);
              }}
              className={`text-white px-5 py-2 rounded text-sm w-28 ${
                status === 'active' ? 'bg-bgActiveStatus' : 'bg-bgInActiveStatus'
              }`}
            >
              {status}
            </button>
            {userId === id && showStatusModal && (
              <StatusModal
                data={{
                  id,
                  title: `Etes-vous sur de vouloir changer le status de cet utilisateur : ${firstname + lastname}`,
                }}
                onClose={() => setShowStatusModal(false)}
                updateStatus={updateUserStatus}
              />
            )}
          </section>
        ))}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePaginatation}
          totalItems={totalUsers}
          pageSize={usersPerPage}
        />
      </section>
    </main>
  );
}
