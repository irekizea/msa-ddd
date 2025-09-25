import {TransactionContext} from "./order-repository.port";


export interface UnitOfWorkPort {
    withTransaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T>;
}
export const UNIT_OF_WORK = Symbol('UNIT_OF_WORK');
