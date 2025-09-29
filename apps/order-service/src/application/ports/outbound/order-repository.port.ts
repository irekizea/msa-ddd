import { Order } from '../../../domain/order-aggregate';

export interface TransactionContext {
  /* marker; infra will pass a tx handle */
}

export interface OrderRepositoryPort {
  findById(id: string, tx?: TransactionContext): Promise<Order | null>;
  save(
    order: Order,
    expectedVersion: number,
    tx?: TransactionContext,
  ): Promise<void>;
}
export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');
