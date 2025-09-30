import { FakeOutbox, FakeRepo, FakeUow } from './helpers';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ChangeOrderStatusService } from '../../../src/application/use-cases/change-order.service';
import { Order } from '../../../src/domain/order-aggregate';

describe('ChangeOrderStatusService', () => {
  it('requires nextStatus', async () => {
    const svc = new ChangeOrderStatusService(
      new FakeRepo() as any,
      new FakeUow() as any,
      new FakeOutbox() as any,
    );
    await expect(
      svc.execute({
        orderId: 'x',
        nextStatus: undefined as any,
        expectedVersion: 1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws NotFound when missing', async () => {
    const svc = new ChangeOrderStatusService(
      new FakeRepo() as any,
      new FakeUow() as any,
      new FakeOutbox() as any,
    );
    await expect(
      svc.execute({ orderId: 'x', nextStatus: 'PAID', expectedVersion: 1 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws Conflict on version mismatch', async () => {
    const repo = new FakeRepo();
    const uow = new FakeUow();
    const outbox = new FakeOutbox();
    const o = Order.create('c', 'KRW');
    o.computeTotals();
    await repo.create(o);
    const svc = new ChangeOrderStatusService(
      repo as any,
      uow as any,
      outbox as any,
    );
    await expect(
      svc.execute({
        orderId: o.id(),
        nextStatus: 'PAID',
        expectedVersion: 999,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('changes status to PAID and emits outbox', async () => {
    const repo = new FakeRepo();
    const uow = new FakeUow();
    const outbox = new FakeOutbox();
    const o = Order.create('c', 'KRW');
    o.computeTotals();
    await repo.create(o);

    const svc = new ChangeOrderStatusService(
      repo as any,
      uow as any,
      outbox as any,
    );
    await svc.execute({
      orderId: o.id(),
      nextStatus: 'PAID',
      expectedVersion: 1,
    });

    const stored = await repo.findById(o.id());
    expect(stored?.status()).toBe('PAID');
    expect(outbox.events.at(-1)?.eventType).toBe('order.status.changed');
  });
});
