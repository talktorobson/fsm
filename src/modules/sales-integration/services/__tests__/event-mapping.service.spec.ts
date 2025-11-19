import { Test, TestingModule } from '@nestjs/testing';
import { EventMappingService } from '../event-mapping.service';
import { KafkaProducerService } from '../../../../common/kafka/kafka-producer.service';
import { SalesSystem, OrderType, Priority } from '../../dto';

describe('EventMappingService', () => {
  let service: EventMappingService;
  let kafkaProducerService: jest.Mocked<KafkaProducerService>;

  beforeEach(async () => {
    const mockKafkaProducerService = {
      send: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventMappingService,
        { provide: KafkaProducerService, useValue: mockKafkaProducerService },
      ],
    }).compile();

    service = module.get<EventMappingService>(EventMappingService);
    kafkaProducerService = module.get(KafkaProducerService) as jest.Mocked<KafkaProducerService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('mapOrderIntakeToServiceOrderCreated', () => {
    it('should map order intake to FSM service order created event', async () => {
      const orderData: any = {
        externalOrderId: 'PX-TEST-001',
        salesSystem: SalesSystem.PYXIS,
        orderType: OrderType.INSTALLATION,
        priority: Priority.HIGH,
        externalReferences: {
          salesOrderId: 'SO-PYXIS-2025-001',
          projectId: 'PROJ-001',
          leadId: 'LEAD-001',
        },
        customer: {
          customerId: 'CUST-001',
        },
        requiredSkills: ['KITCHEN_INSTALL'],
        estimatedDuration: 120,
        schedulingPreferences: {
          preferredDate: '2025-02-01',
        },
        serviceItems: [],
        totalAmount: {},
      };

      await service.mapOrderIntakeToServiceOrderCreated(
        'PX-TEST-001',
        SalesSystem.PYXIS,
        orderData,
        'FSM-001',
        'corr-001',
      );

      expect(kafkaProducerService.send).toHaveBeenCalledWith(
        'fsm.service_order.created',
        expect.objectContaining({
          eventType: 'SERVICE_ORDER_CREATED',
          serviceOrderId: 'FSM-001',
        }),
        'FSM-001',
        expect.objectContaining({
          'correlation-id': 'corr-001',
        }),
      );
    });
  });

  describe('mapServiceOrderStatusToSalesSystemEvent', () => {
    it('should map FSM status update to sales system event', async () => {
      await service.mapServiceOrderStatusToSalesSystemEvent(
        'FSM-001',
        'PX-TEST-001',
        SalesSystem.PYXIS,
        'CREATED',
        'SCHEDULED',
        'corr-001',
      );

      expect(kafkaProducerService.send).toHaveBeenCalledWith(
        'sales.pyxis.status_update',
        expect.objectContaining({
          eventType: 'SERVICE_ORDER_STATUS_UPDATED',
          fsmServiceOrderId: 'FSM-001',
          externalOrderId: 'PX-TEST-001',
          newStatus: 'SCHEDULED',
        }),
        'PX-TEST-001',
        expect.objectContaining({
          'correlation-id': 'corr-001',
        }),
      );
    });
  });
});
