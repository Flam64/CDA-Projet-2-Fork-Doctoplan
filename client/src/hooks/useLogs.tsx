import { useState, useEffect } from 'react';
import { logsService, LogsQueryParams, LogsResponse, Log } from '@/services/logsService';

export const useLogs = (params: LogsQueryParams = {}) => {
  const [data, setData] = useState<LogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async (queryParams: LogsQueryParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await logsService.getLogs(queryParams);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.limit, params.offset, params.search]);

  const refetch = () => {
    fetchLogs(params);
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
};

export const useLogById = (id: string | null) => {
  const [data, setData] = useState<Log | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLog = async (logId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await logsService.getLogById(logId);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchLog(id);
    } else {
      setData(null);
      setError(null);
    }
  }, [id]);

  return {
    data,
    loading,
    error,
  };
};
