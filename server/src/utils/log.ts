import { grpcClient } from './grpcClient';
import { LogResponse } from '../types/grpc.type';

export default async function log(
  message: string,
  metadata: Record<string, string | number | boolean>,
): Promise<LogResponse> {
  try {
    const stringMetadata: Record<string, string> = {};
    for (const [key, value] of Object.entries(metadata)) {
      stringMetadata[key] = String(value);
    }

    return await grpcClient.createLog(message, stringMetadata);
  } catch (error) {
    console.error('Failed to create log entry via gRPC:', error);
    throw error;
  }
}
