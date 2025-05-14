import { useGetLogByIdQuery } from '@/types/graphql-generated';
import { X } from 'lucide-react';

type LogDetailModalProps = {
  logId: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function LogDetailModal({ logId, isOpen, onClose }: LogDetailModalProps) {
  const { data, loading, error } = useGetLogByIdQuery({
    variables: { id: logId },
    skip: !isOpen,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-borderColor flex items-center justify-between">
          <h2 className="text-xl font-semibold">Détails du log</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            <X size={24} />
          </button>
        </div>

        {loading && (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-t-2 border-blue rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        {error && (
          <div className="p-8 text-center text-red-600">Erreur lors du chargement du log</div>
        )}

        {data?.getLogById && (
          <div className="p-6 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <label htmlFor="titre" className="block text-sm font-medium text-gray-600 mb-1">
                  Titre
                </label>
                <p id="titre" className="text-blue font-medium">
                  {data.getLogById.titre}
                </p>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-600 mb-1">
                  Date et heure
                </label>
                <p id="date" className="text-gray-800">
                  {new Date(data.getLogById.createAt).toLocaleString('fr-FR')}
                </p>
              </div>

              <div>
                <label htmlFor="metadata" className="block text-sm font-medium text-gray-600 mb-1">
                  Métadonnées
                </label>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <pre id="metadata" className="text-sm text-gray-800 overflow-x-auto">
                    {JSON.stringify(data.getLogById.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
