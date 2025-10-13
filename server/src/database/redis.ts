import { createClient } from 'redis';
import 'dotenv/config';

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

redisClient.on('error', (err) => {
  console.error('Redis error', err);
});

redisClient.on('connect', () => {
  console.info('Redis connected');
});
export default redisClient;
