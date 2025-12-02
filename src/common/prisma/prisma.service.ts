import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Service that extends PrismaClient to provide database access.
 *
 * Handles database connection lifecycle (connect/disconnect) and logging.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
    });
  }

  /**
   * Initializes the database connection and sets up query logging in development.
   */
  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Database connected successfully');

    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      this.$on('query' as never, (e: { query: string; duration: number }) => {
        this.logger.debug(`Query: ${e.query}`);
        this.logger.debug(`Duration: ${e.duration}ms`);
      });
    }
  }

  /**
   * Closes the database connection when the module is destroyed.
   */
  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🔌 Database disconnected');
  }

  /**
   * Cleans the database by truncating tables.
   *
   * @throws {Error} If attempting to clean database in production environment.
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    // Delete all records in reverse order of dependencies
    const tables = [
      'refresh_tokens',
      'user_roles',
      'role_permissions',
      'technicians',
      'work_teams',
      'providers',
      'permissions',
      'roles',
      'users',
      'event_outbox',
      'business_unit_config',
      'country_config',
      'system_config',
    ];

    for (const table of tables) {
      await this.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    }
  }
}
