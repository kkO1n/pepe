import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { TRANSFER_COMPLETED_TOPIC } from '@contracts/index';
import { KafkaNotificationEventsAdapter } from './kafka-notification-events.adapter';

describe('KafkaNotificationEventsAdapter', () => {
  let adapter: KafkaNotificationEventsAdapter;
  let notificationClient: { emit: jest.Mock };

  beforeEach(async () => {
    notificationClient = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KafkaNotificationEventsAdapter,
        {
          provide: 'NOTIFICATION_SERVICE',
          useValue: notificationClient,
        },
      ],
    }).compile();

    adapter = module.get(KafkaNotificationEventsAdapter);
  });

  it('emits transfer event envelope to transfer_completed topic', () => {
    adapter.publishTransferCompleted({
      authId: 5,
      recipientId: 8,
      amount: 12.34,
    });

    expect(notificationClient.emit).toHaveBeenCalledWith(
      TRANSFER_COMPLETED_TOPIC,
      expect.objectContaining({
        eventType: TRANSFER_COMPLETED_TOPIC,
        eventVersion: 1,
        payload: {
          authId: 5,
          recipientId: 8,
          amount: 12.34,
        },
      }),
    );
  });
});
