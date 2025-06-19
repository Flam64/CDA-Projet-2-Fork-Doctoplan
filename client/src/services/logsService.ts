import axios from './axios';

export type Log = {
  id: string;
  titre: string;
  metadata: string;
  createAt: string;
};

export type LogsResponse = {
  logs: Log[];
  total: number;
};

export type LogsQueryParams = {
  limit?: number;
  offset?: number;
  search?: string | undefined;
};

export const logsService = {
  async getLogs(params: LogsQueryParams = {}): Promise<LogsResponse> {
    const searchParams = new URLSearchParams();

    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    if (params.search) searchParams.append('search', params.search);

    const response = await axios.get(
      `${import.meta.env.VITE_FRONTEND_URL}/logs?${searchParams.toString()}`,
    );
    return response.data;
  },

  async getLogById(id: string): Promise<Log> {
    const response = await axios.get(`${import.meta.env.VITE_FRONTEND_URL}/logs/${id}`);
    return response.data;
  },
};
