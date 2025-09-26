import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  CANCEL_ORDER_USECASE,
  CancelOrderCommand,
  CancelOrderUseCase,
} from '../ports/inbound/cancel-order.usecase';
import {
  ORDER_REPOSITORY,
  OrderRepositoryPort,
  TransactionContext,
} from '../ports/outbound/order-repository.port';
import {
  UNIT_OF_WORK,
  UnitOfWorkPort,
} from '../ports/outbound/unit-of-work.port';
import { OUTBOX_PORT, OutboxPort } from '../ports/outbound/outbox.port';

@Injectable()
export class CancelOrderService implements CancelOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly repo: OrderRepositoryPort,
    @Inject(UNIT_OF_WORK) private readonly uow: UnitOfWorkPort,
    @Inject(OUTBOX_PORT) private readonly outbox: OutboxPort,
  ) {}

  async execute(cmd: CancelOrderCommand): Promise<void> {
    await this.uow.withTransaction<void>(async (tx: TransactionContext) => {
      const order = await this.repo.findById(cmd.orderId, tx);
      if (!order) throw new NotFoundException('Order not found');

      const expected = cmd.expectedVersion;
      order.cancel();

      try {
        await this.repo.save(order, expected, tx);
      } catch (e: any) {
        if (/Version conflict/i.test(String(e?.message))) {
          throw new ConflictException('Version conflict');
        }
        throw e;
      }

      await this.outbox.append(
        'order.status.changed',
        order.id(),
        {
          orderId: order.id(),
          status: order.status(),
          version: order.version(),
          occurredAt: new Date().toISOString(),
        },
        order.version(),
        tx,
      );
    });
  }
}
