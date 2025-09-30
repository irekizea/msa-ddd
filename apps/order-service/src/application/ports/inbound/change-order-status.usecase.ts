export type ChangeOrderStatusCommand = {
  orderId: string;
  nextStatus: 'PAID' | 'CANCELLED';
  expectedVersion: number;
};

export interface ChangeOrderStatusUseCase {
  execute(cmd: ChangeOrderStatusCommand): Promise<void>;
}

export const CHANGE_ORDER_STATUS_USECASE = Symbol(
  'CHANGE_ORDER_STATUS_USECASE',
);
