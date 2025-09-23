export type CancelOrderCommand = {
    orderId: string;
    expectedVersion: number; // optimistic concurrency guard
};

export interface CancelOrderUseCase {
    execute(cmd: CancelOrderCommand): Promise<void>;
}

export const CANCEL_ORDER_USECASE = Symbol('CANCEL_ORDER_USECASE');