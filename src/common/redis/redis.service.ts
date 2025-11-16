import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private configService: ConfigService) {}

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

  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('🔌 Redis disconnected');
  }

  /**
   * Get client for direct access
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * Set key-value with optional TTL (seconds)
   */
  async set(key: string, value: string | Buffer, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * Get value by key
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * Get buffer value (for bitmaps)
   */
  async getBuffer(key: string): Promise<Buffer | null> {
    return this.client.getBuffer(key);
  }

  /**
   * Delete key
   */
  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  /**
   * Set expiration (seconds)
   */
  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  /**
   * Increment counter
   */
  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  /**
   * Decrement counter
   */
  async decr(key: string): Promise<number> {
    return this.client.decr(key);
  }

  /**
   * Execute Lua script
   */
  async eval(script: string, numKeys: number, ...args: (string | number)[]): Promise<unknown> {
    return this.client.eval(script, numKeys, ...args);
  }
}
