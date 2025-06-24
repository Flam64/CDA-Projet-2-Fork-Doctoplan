import { PlanningTable } from '@/components/user/PlanningTable';
import { useGetUserByIdQuery } from '@/types/graphql-generated';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function DoctorPlanning() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);

  const { data, error, loading } = useGetUserByIdQuery({
    variables: { id: String(id ?? '') },
  });
  const userPlanning = data?.getUserById.plannings;
  const user = data?.getUserById;
  return (
    <main className="container  mx-auto pt-4 pr-12 pl-12 pb-12 flex items-center flex-col gap-4">
      {loading && <p className="px-2 text-sm text-gray-500">Chargement...</p>}
      {error && <p className="px-2 text-sm text-gray-500">error...</p>}
      <div className="w-[80%]">
        <header className="flex items-center mb-4">
          <h2 className="text-xl mr-5 font-semibold text-gray-700">
            Le planning de {user && user.firstname} {user && user.lastname}
          </h2>
          <Link className="bg-blue text-white px-4 py-2 rounded-md" to={'create'}>
            Nouvel utilistateur
          </Link>
        </header>
        <div className="w-full">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500">
            {userPlanning &&
              userPlanning.map((planning, index) => (
                <li key={planning.id} className="me-2">
                  <button
                    onClick={() => setActiveTab(index)}
                    className={`inline-block p-4 border-b-2 rounded-t-lg ${
                      activeTab === index
                        ? 'text-blue-600 border-blue-600 active'
                        : 'hover:text-gray-600 hover:border-gray-300 border-transparent'
                    }`}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === index}
                  >
                    {planning.start} - {planning.end ?? ''}
                  </button>
                </li>
              ))}
          </ul>

          <div className="p-4 bg-white border border-t-0 rounded-b-lg">
            {userPlanning &&
              userPlanning.map((planning, index) => (
                <div key={planning.id} className={`${activeTab === index ? 'block' : 'hidden'}`}>
                  <PlanningTable schedule={planning} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}
