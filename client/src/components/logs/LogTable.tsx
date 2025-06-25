import { Log } from '@/services/logsService';
import { Eye } from 'lucide-react';

type LogTableProps = {
  logs: Log[];
  onViewLog: (id: string) => void;
};

export default function LogTable({ logs, onViewLog }: LogTableProps) {
  return (
    <div className="border border-borderColor rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-lightBlue border-b border-borderColor">
          <tr>
            <th className="text-left p-4 font-medium text-blue">Date</th>
            <th className="text-left p-4 font-medium text-blue">Titre</th>
            <th className="text-left p-4 font-medium text-blue">Métadonnées</th>
            <th className="text-left p-4 font-medium text-blue">Actions</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => {
            const metadata = log.metadata ? JSON.parse(log.metadata) : {};
            return (
              <tr key={log.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-4 text-sm text-gray-600">
                  {new Date(log.createAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="p-4 text-sm font-medium text-blue">{log.titre}</td>
                <td className="p-4 text-sm text-gray-600">
                  <div className="flex gap-2 flex-wrap">
                    {Object.keys(metadata)
                      .slice(0, 2)
                      .map(key => (
                        <span key={key} className="bg-blue/10 text-blue px-2 py-1 rounded text-xs">
                          {key}
                        </span>
                      ))}
                    {Object.keys(metadata).length > 2 && (
                      <span className="text-gray-400 text-xs">
                        +{Object.keys(metadata).length - 2} plus
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => onViewLog(log.id)}
                    className="text-blue hover:text-accent transition-colors p-2 rounded-lg hover:bg-lightBlue"
                    aria-label={`Voir les détails du log ${log.titre}`}
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
