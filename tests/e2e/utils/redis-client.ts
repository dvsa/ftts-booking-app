/* eslint-disable import/no-cycle */
import * as redis from 'redis';
import * as util from 'util';
import { RedisClient } from 'redis';
import { SessionData } from '../data/session-data';

export async function writeCookieDataToRedis(sessionId: string, sessionData: SessionData): Promise<void> {
  // Connect to the Azure Cache for Redis over the TLS port using the key.
  const host = process.env.SESSION_STORAGE_URL || '';
  const password = process.env.SESSION_STORAGE_PASSWORD || '';
  const port: number = parseInt(process.env.SESSION_STORAGE_PORT || '6380', 10);

  const cookieStringData = JSON.stringify(sessionData);

  let connection: RedisClient;
  if (port === 6380) {
    connection = redis.createClient(
      {
        port,
        host,
        no_ready_check: true,
        auth_pass: password,
        tls: { servername: host },
      },
    );
  } else {
    connection = redis.createClient(
      {
        port,
        host,
        no_ready_check: true,
        auth_pass: password,
      },
    );
  }
  const setAsync = util.promisify(connection.set).bind(connection);
  const expireAsync = util.promisify(connection.expire).bind(connection);
  const quitAsync = util.promisify(connection.quit).bind(connection);

  await setAsync(`sess:${sessionId}`, cookieStringData);
  await expireAsync(`sess:${sessionId}`, 600);

  await quitAsync();
}
