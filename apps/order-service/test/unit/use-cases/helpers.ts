import {
  OrderRepositoryPort,
  TransactionContext,
} from '../../../src/application/ports/outbound/order-repository.port';
import { UnitOfWorkPort } from '../../../src/application/ports/outbound/unit-of-work.port';
import { OutboxPort } from '../../../src/application/ports/outbound/outbox.port';
import { Order } from '../../../src/domain/order-aggregate';

export class FakeRepo implements OrderRepositoryPort {
  store = new Map<string, ReturnType<Order['toPrimitives']>>();
  async findById(id: string): Promise<Order | null> {
    const p = this.store.get(id);
    return p ? Order.fromPrimitives(p) : null;
  }
  async create(order: Order): Promise<void> {
    this.store.set(order.id(), order.toPrimitives());
  }
  async update(order: Order, expectedVersion: number): Promise<void> {
    const cur = this.store.get(order.id());
    if (!cur) throw new Error('Not found');
    if (cur.version !== expectedVersion) throw new Error('Version conflict');
    this.store.set(order.id(), order.toPrimitives());
  }

  save(
    order: Order,
    expectedVersion: number,
    tx?: TransactionContext,
  ): Promise<void> {
    return Promise.resolve(undefined);
  }
}

export class FakeUow implements UnitOfWorkPort {
  async withTransaction<T>(
    fn: (tx: TransactionContext) => Promise<T>,
  ): Promise<T> {
    return fn({} as any);
  }
}

export class FakeOutbox implements OutboxPort {
  events: any[] = [];
  async append(
    eventType: string,
    key: string,
    payload: any,
    version: number,
  ): Promise<void> {
    this.events.push({ eventType, key, payload, version });
  }
}
