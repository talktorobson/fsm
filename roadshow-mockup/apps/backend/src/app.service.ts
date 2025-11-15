import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      demoMode: process.env.DEMO_MODE === 'true',
    };
  }

  getVersion() {
    return {
      version: '0.1.0',
      name: 'Yellow Grid Platform API',
      description: 'Roadshow Demo Mockup',
      apiVersion: 'v1',
    };
  }
}
