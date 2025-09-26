import { Injectable } from '@nestjs/common';
import {
  ORDER_REPOSITORY,
  OrderRepositoryPort,
  TransactionContext,
} from '../../../application/ports/outbound/order-repository.port';
import { Order } from '../../../domain/order-aggregate';

type Store = Map<string, ReturnType<Order['toPrimitives']>>;

@Injectable()
export class InMemoryOrderRepository implements OrderRepositoryPort {
  private store: Store = new Map();

  async findById(id: string, _tx?: TransactionContext): Promise<Order | null> {
    const p = this.store.get(id);
    return p ? Order.fromPrimitives(p) : null;
  }

  async save(
    order: Order,
    expectedVersion: number,
    _tx: TransactionContext,
  ): Promise<void> {
    const current = this.store.get(order.id());
    if (!current) throw new Error('Not found');
    if (current.version !== expectedVersion)
      throw new Error('Version conflict');
    const p = order.toPrimitives();
    this.store.set(p.id, p);
  }
}
