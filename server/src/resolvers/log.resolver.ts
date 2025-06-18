import { Arg, Query, Resolver, Int, Authorized } from 'type-graphql';

import { Log, LogsResponse } from '../types/log.type';
import { UserRole } from '../entities/user.entity';
import { grpcClient } from '../utils/grpcClient';

@Resolver()
export class LogResolver {
  @Authorized([UserRole.ADMIN])
  @Query(() => LogsResponse)
  async getLogs(
    @Arg('limit', () => Int, { nullable: true }) limit?: number,
    @Arg('offset', () => Int, { nullable: true }) offset?: number,
    @Arg('search', { nullable: true }) search?: string,
  ): Promise<LogsResponse> {
    try {
      const response = await grpcClient.getLogs();

      let logs = response.logs.map((log) => ({
        id: log.id,
        titre: log.titre,
        metadata: JSON.stringify(log.metadata),
        createAt: log.create_at,
      }));

      if (search) {
        logs = logs.filter((log) => log.titre.toLowerCase().includes(search.toLowerCase()));
      }

      const total = logs.length;

      if (offset !== undefined) {
        logs = logs.slice(offset);
      }
      if (limit !== undefined) {
        logs = logs.slice(0, limit);
      }

      return {
        logs,
        total,
      };
    } catch (error) {
      console.error('Error fetching logs via gRPC:', error);
      throw new Error('Failed to fetch logs');
    }
  }

  @Authorized([UserRole.ADMIN])
  @Query(() => Log, { nullable: true })
  async getLogById(@Arg('id') id: string): Promise<Log | null> {
    try {
      const response = await grpcClient.getLogs();
      const log = response.logs.find((l) => l.id === id);

      if (!log) {
        return null;
      }

      return {
        id: log.id,
        titre: log.titre,
        metadata: JSON.stringify(log.metadata),
        createAt: log.create_at,
      };
    } catch (error) {
      console.error('Error fetching log by ID via gRPC:', error);
      throw new Error('Failed to fetch log');
    }
  }
}
