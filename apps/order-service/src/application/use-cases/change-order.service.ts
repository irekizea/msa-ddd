import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  CHANGE_ORDER_STATUS_USECASE,
  ChangeOrderStatusCommand,
  ChangeOrderStatusUseCase,
} from '../ports/inbound/change-order-status.usecase';
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
export class ChangeOrderStatusService implements ChangeOrderStatusUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly repo: OrderRepositoryPort,
    @Inject(UNIT_OF_WORK) private readonly uow: UnitOfWorkPort,
    @Inject(OUTBOX_PORT) private readonly outbox: OutboxPort,
  ) {}

  async execute(cmd: ChangeOrderStatusCommand): Promise<void> {
    if (!cmd.nextStatus)
      throw new BadRequestException('nextStatus is required');

    await this.uow.withTransaction(async (tx: TransactionContext) => {
      const order = await this.repo.findById(cmd.orderId, tx);
      if (!order) throw new NotFoundException('Order not found');

      order.changeStatus(cmd.nextStatus);

      // try {
      //   await this.repo.update(order, cmd.expectedVersion, tx);
      // } catch (e: any) {
      //   if (/Version conflict/i.test(String(e?.message)))
      //     throw new ConflictException('Version conflict');
      //   throw e;
      // }

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
