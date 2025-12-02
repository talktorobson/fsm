import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

/**
 * Main application controller.
 *
 * Handles basic application routes like health checks and root information.
 */
@ApiTags('health')
@Controller()
export class AppController {
  /**
   * Health check endpoint to verify the service status.
   *
   * @returns {object} An object containing the status, timestamp, service name, and version.
   */
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'yellow-grid-api',
      version: '0.1.0',
    };
  }

  /**
   * Root endpoint providing basic API information.
   *
   * @returns {object} An object containing a welcome message, version, and link to documentation.
   */
  @Get()
  @ApiOperation({ summary: 'Root endpoint' })
  root() {
    return {
      message: 'Yellow Grid Platform API',
      version: '0.1.0',
      documentation: '/api/docs',
    };
  }
}
