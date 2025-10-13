import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import createSchema from './schema';
import { dataSource } from './database/client';
import { grpcClient } from './utils/grpcClient';

import 'dotenv/config';
import 'reflect-metadata';
import redisClient from './database/redis';

async function startServer() {
  await dataSource.initialize();
  try {
    await redisClient.connect();
    console.info('Redis connected');
  } catch (error) {
    console.error('redis not connected', error);
  }

  const schema = await createSchema();

  const server = new ApolloServer({
    schema,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: parseInt(process.env.PORT as string) || 4000 },
    context: async ({ req, res }) => ({
      req,
      res,
      grpcClient,
    }),
  });

  grpcClient.createLog('Server has started', { server: 'started' });

  console.info(`🚀 Server ready at ${url}`);
}

startServer();
