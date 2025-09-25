import { TransactionContext } from './order-repository.port';

export interface OutboxPort {
    append(eventType: string, key: string, payload: any, tx: TransactionContext): Promise<void>;
}
export const OUTBOX_PORT = Symbol('OUTBOX_PORT');
