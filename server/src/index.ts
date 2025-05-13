import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import createSchema from './schema';
import { dataSource } from './database/client';
import { transporter } from './utils/transporter';

import 'dotenv/config';
import 'reflect-metadata';

async function startServer() {
  await dataSource.initialize();

  const schema = await createSchema();

  transporter.verify((error, success) => {
    if (error) {
      console.error(error);
    } else {
      console.info('Server is ready to take our messages: ', success);
    }
  });

  const server = new ApolloServer({
    schema,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: parseInt(process.env.PORT as string) || 4000 },
    context: async ({ req, res }) => ({ req, res }),
  });

  console.info(`🚀 Server ready at ${url}`);
}

startServer();
