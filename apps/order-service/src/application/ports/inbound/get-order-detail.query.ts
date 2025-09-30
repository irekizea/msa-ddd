export type GetOrderDetailQuery = {
  orderId: string;
};

export type GetOrderDetailResult = {
  orderId: string;
  customerId: string;
  status: 'CREATED' | 'PAID' | 'CANCELLED';
  paymentStatus?: string | null;
  totalAmount: number;
  currency: 'KRW' | 'USD' | 'EUR';
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  version: number;
};

export interface GetOrderDetailUseCase {
  execute(q: GetOrderDetailQuery): Promise<GetOrderDetailResult | null>;
}

export const GET_ORDER_DETAIL_USECASE = Symbol('GET_ORDER_DETAIL_USECASE');
