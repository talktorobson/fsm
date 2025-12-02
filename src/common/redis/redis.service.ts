import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Service for interacting with Redis.
 *
 * Provides methods for standard Redis operations like set, get, del, etc.
 * Handles Redis connection and error logging.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private configService: ConfigService) {}

  /**
   * Initializes the Redis connection.
   */
  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379');

    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('connect', () => {
      this.logger.log('✅ Redis connected successfully');
    });

    this.client.on('error', (error) => {
      this.logger.error('❌ Redis connection error:', error);
    });
  }

  /**
   * Closes the Redis connection.
   */
  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('🔌 Redis disconnected');
  }

  /**
   * Returns the underlying Redis client instance.
   *
   * @returns {Redis} The ioredis client instance.
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * Sets a key-value pair in Redis with an optional expiration time.
   *
   * @param key - The key to set.
   * @param value - The value to store (string or Buffer).
   * @param ttl - Optional Time-To-Live in seconds.
   * @returns {Promise<void>}
   */
  async set(key: string, value: string | Buffer, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * Gets a value by key.
   *
   * @param key - The key to retrieve.
   * @returns {Promise<string | null>} The value, or null if not found.
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * Gets a value as a buffer (useful for bitmaps or binary data).
   *
   * @param key - The key to retrieve.
   * @returns {Promise<Buffer | null>} The value as a Buffer, or null if not found.
   */
  async getBuffer(key: string): Promise<Buffer | null> {
    return this.client.getBuffer(key);
  }

  /**
   * Deletes a key.
   *
   * @param key - The key to delete.
   * @returns {Promise<number>} The number of keys deleted.
   */
  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  /**
   * Sets an expiration on a key.
   *
   * @param key - The key to expire.
   * @param seconds - The time in seconds until expiration.
   * @returns {Promise<number>} 1 if the timeout was set, 0 if the key does not exist.
   */
  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }

  /**
   * Checks if a key exists.
   *
   * @param key - The key to check.
   * @returns {Promise<number>} 1 if the key exists, 0 otherwise.
   */
  async exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  /**
   * Increments the number stored at key by one.
   *
   * @param key - The key to increment.
   * @returns {Promise<number>} The value of the key after the increment.
   */
  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  /**
   * Decrements the number stored at key by one.
   *
   * @param key - The key to decrement.
   * @returns {Promise<number>} The value of the key after the decrement.
   */
  async decr(key: string): Promise<number> {
    return this.client.decr(key);
  }

  /**
   * Executes a Lua script.
   *
   * @param script - The Lua script source.
   * @param numKeys - The number of arguments that represent keys.
   * @param args - The arguments for the script.
   * @returns {Promise<unknown>} The result of the script execution.
   */
  async eval(script: string, numKeys: number, ...args: (string | number)[]): Promise<unknown> {
    return this.client.eval(script, numKeys, ...args);
  }
}
