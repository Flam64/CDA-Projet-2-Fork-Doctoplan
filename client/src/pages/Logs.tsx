import { useState } from 'react';

import { Search, FileText } from 'lucide-react';

import LogTable from '@/components/logs/LogTable';
import LogDetailModal from '@/components/logs/LogDetailModal';
import Pagination from '@/components/logs/Pagination';
import { useLogs } from '@/hooks/useLogs';

export default function Logs() {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const pageSize = 10;
  const offset = currentPage * pageSize;

  const { data, loading, error, refetch } = useLogs({
    limit: pageSize,
    offset,
    search: searchTerm || undefined,
  });

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto p-4 h-screen max-w-7xl">
      <div className="bg-white rounded-lg shadow-sm border border-borderColor overflow-hidden">
        <header className="p-6 border-b border-borderColor">
          <section className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="text-blue" size={24} />
              <h1 className="text-2xl font-bold text-blue">Journal des activités</h1>
            </div>
            <button onClick={() => refetch()} className="standard-button">
              Actualiser
            </button>
          </section>

          <section className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Rechercher dans les logs..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue"
            />
          </section>
        </header>

        {loading && (
          <main className="p-8 text-center">
            <div className="w-8 h-8 border-t-2 border-blue rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des logs...</p>
          </main>
        )}

        {error && (
          <main className="p-8 text-center">
            <p className="text-red-600">Erreur lors du chargement des logs</p>
            <button onClick={() => refetch()} className="mt-4 standard-button">
              Réessayer
            </button>
          </main>
        )}

        {data?.logs && !loading ? (
          <>
            <LogTable logs={data.logs} onViewLog={setSelectedLogId} />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={data.total}
              pageSize={pageSize}
            />
          </>
        ) : (
          <main className="p-8 text-center">
            <FileText className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600">Aucun log disponible</p>
            <p className="text-sm text-gray-400 mt-2">
              Les logs apparaîtront ici une fois disponibles
            </p>
          </main>
        )}

        {data && data?.logs && data?.logs.length === 0 && !loading && (
          <main className="p-8 text-center">
            <FileText className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600">Aucun log trouvé</p>
            {searchTerm && (
              <p className="text-sm text-gray-400 mt-2">Essayez d&apos;ajuster votre recherche</p>
            )}
          </main>
        )}
      </div>

      <LogDetailModal
        logId={selectedLogId || ''}
        isOpen={!!selectedLogId}
        onClose={() => setSelectedLogId(null)}
      />
    </div>
  );
}
