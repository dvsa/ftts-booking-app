import connectRedis from 'connect-redis';
import expressSession from 'express-session';
import redis from 'redis';

import config from '../config';

const RedisStore = connectRedis(expressSession);

const client = redis.createClient(config.redisClient);

const store = new RedisStore({
  client,
  ttl: 86400,
});

const fttsSession = expressSession({
  ...config.session,
  store,
});

export default fttsSession;
