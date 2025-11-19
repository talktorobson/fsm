import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DistanceCalculationService, Coordinates } from './distance-calculation.service';
import { Decimal } from '@prisma/client/runtime/library';

describe('DistanceCalculationService', () => {
  let service: DistanceCalculationService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistanceCalculationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(undefined), // No Google API key by default
          },
        },
      ],
    }).compile();

    service = module.get<DistanceCalculationService>(DistanceCalculationService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateDistance', () => {
    it('should calculate distance between Madrid and Barcelona using Haversine', async () => {
      // Madrid coordinates
      const madrid: Coordinates = {
        latitude: 40.4168,
        longitude: -3.7038,
      };

      // Barcelona coordinates
      const barcelona: Coordinates = {
        latitude: 41.3851,
        longitude: 2.1734,
      };

      const result = await service.calculateDistance(madrid, barcelona);

      // Approximate distance is ~504 km
      expect(result.distanceKm).toBeGreaterThan(500);
      expect(result.distanceKm).toBeLessThan(510);
      expect(result.method).toBe('haversine');
      expect(result.calculatedAt).toBeInstanceOf(Date);
    });

    it('should calculate distance between nearby postal codes', async () => {
      // Madrid center (28001)
      const madrid28001: Coordinates = {
        latitude: 40.4168,
        longitude: -3.7038,
      };

      // Madrid Salamanca district (28006)
      const madrid28006: Coordinates = {
        latitude: 40.4261,
        longitude: -3.6768,
      };

      const result = await service.calculateDistance(madrid28001, madrid28006);

      // Approximate distance is ~3 km
      expect(result.distanceKm).toBeGreaterThan(2);
      expect(result.distanceKm).toBeLessThan(5);
      expect(result.method).toBe('haversine');
    });

    it('should calculate zero distance for same location', async () => {
      const location: Coordinates = {
        latitude: 40.4168,
        longitude: -3.7038,
      };

      const result = await service.calculateDistance(location, location);

      expect(result.distanceKm).toBe(0);
      expect(result.method).toBe('haversine');
    });

    it('should throw error for invalid latitude', async () => {
      const from: Coordinates = {
        latitude: 91, // Invalid
        longitude: -3.7038,
      };

      const to: Coordinates = {
        latitude: 40.4168,
        longitude: -3.7038,
      };

      await expect(service.calculateDistance(from, to)).rejects.toThrow(
        'Latitude must be between -90 and 90 degrees',
      );
    });

    it('should throw error for invalid longitude', async () => {
      const from: Coordinates = {
        latitude: 40.4168,
        longitude: -181, // Invalid
      };

      const to: Coordinates = {
        latitude: 40.4168,
        longitude: -3.7038,
      };

      await expect(service.calculateDistance(from, to)).rejects.toThrow(
        'Longitude must be between -180 and 180 degrees',
      );
    });
  });

  describe('calculateDistanceScore', () => {
    it('should return 20 points for distance 0-10 km', () => {
      expect(service.calculateDistanceScore(0)).toBe(20);
      expect(service.calculateDistanceScore(5)).toBe(20);
      expect(service.calculateDistanceScore(10)).toBe(20);
    });

    it('should return 15 points for distance 10-30 km', () => {
      expect(service.calculateDistanceScore(10.01)).toBe(15);
      expect(service.calculateDistanceScore(20)).toBe(15);
      expect(service.calculateDistanceScore(30)).toBe(15);
    });

    it('should return 10 points for distance 30-50 km', () => {
      expect(service.calculateDistanceScore(30.01)).toBe(10);
      expect(service.calculateDistanceScore(40)).toBe(10);
      expect(service.calculateDistanceScore(50)).toBe(10);
    });

    it('should return 5 points for distance > 50 km', () => {
      expect(service.calculateDistanceScore(50.01)).toBe(5);
      expect(service.calculateDistanceScore(100)).toBe(5);
      expect(service.calculateDistanceScore(500)).toBe(5);
    });
  });

  describe('decimalToCoordinates', () => {
    it('should convert Prisma Decimal to Coordinates', () => {
      const latitude = new Decimal('40.4168');
      const longitude = new Decimal('-3.7038');

      const result = service.decimalToCoordinates(latitude, longitude);

      expect(result).not.toBeNull();
      expect(result!.latitude).toBe(40.4168);
      expect(result!.longitude).toBe(-3.7038);
    });

    it('should return null for null latitude', () => {
      const result = service.decimalToCoordinates(null, new Decimal('-3.7038'));

      expect(result).toBeNull();
    });

    it('should return null for null longitude', () => {
      const result = service.decimalToCoordinates(new Decimal('40.4168'), null);

      expect(result).toBeNull();
    });

    it('should return null for both null', () => {
      const result = service.decimalToCoordinates(null, null);

      expect(result).toBeNull();
    });
  });

  describe('Google Distance Matrix API', () => {
    it('should fall back to Haversine when Google API fails', async () => {
      // Configure service with Google API key
      jest.spyOn(configService, 'get').mockReturnValue('fake-api-key');

      // Mock fetch to simulate API failure
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const from: Coordinates = {
        latitude: 40.4168,
        longitude: -3.7038,
      };

      const to: Coordinates = {
        latitude: 41.3851,
        longitude: 2.1734,
      };

      const result = await service.calculateDistance(from, to, {
        method: 'google_distance_matrix',
      });

      // Should fall back to Haversine
      expect(result.method).toBe('haversine');
      expect(result.distanceKm).toBeGreaterThan(500);
    });
  });

  describe('Haversine formula accuracy', () => {
    it('should match known distances within acceptable margin', async () => {
      // Test cases with known distances
      const testCases = [
        {
          name: 'New York to Los Angeles',
          from: { latitude: 40.7128, longitude: -74.006 },
          to: { latitude: 34.0522, longitude: -118.2437 },
          expectedKm: 3944, // Approximate
          marginKm: 50,
        },
        {
          name: 'London to Paris',
          from: { latitude: 51.5074, longitude: -0.1278 },
          to: { latitude: 48.8566, longitude: 2.3522 },
          expectedKm: 344, // Approximate
          marginKm: 10,
        },
        {
          name: 'Tokyo to Osaka',
          from: { latitude: 35.6762, longitude: 139.6503 },
          to: { latitude: 34.6937, longitude: 135.5023 },
          expectedKm: 397, // Approximate
          marginKm: 10,
        },
      ];

      for (const testCase of testCases) {
        const result = await service.calculateDistance(testCase.from, testCase.to);

        expect(result.distanceKm).toBeGreaterThan(testCase.expectedKm - testCase.marginKm);
        expect(result.distanceKm).toBeLessThan(testCase.expectedKm + testCase.marginKm);
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle coordinates at poles', async () => {
      const northPole: Coordinates = {
        latitude: 90,
        longitude: 0,
      };

      const southPole: Coordinates = {
        latitude: -90,
        longitude: 0,
      };

      const result = await service.calculateDistance(northPole, southPole);

      // Distance should be half Earth's circumference (~20,000 km)
      expect(result.distanceKm).toBeGreaterThan(19900);
      expect(result.distanceKm).toBeLessThan(20100);
    });

    it('should handle coordinates at dateline', async () => {
      const west: Coordinates = {
        latitude: 0,
        longitude: 179.9,
      };

      const east: Coordinates = {
        latitude: 0,
        longitude: -179.9,
      };

      const result = await service.calculateDistance(west, east);

      // Distance should be very small (0.2 degrees)
      expect(result.distanceKm).toBeLessThan(50);
    });

    it('should handle equator crossing', async () => {
      const north: Coordinates = {
        latitude: 1,
        longitude: 0,
      };

      const south: Coordinates = {
        latitude: -1,
        longitude: 0,
      };

      const result = await service.calculateDistance(north, south);

      // Distance should be ~222 km (2 degrees latitude)
      expect(result.distanceKm).toBeGreaterThan(220);
      expect(result.distanceKm).toBeLessThan(225);
    });
  });
});
