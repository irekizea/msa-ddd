import { GetOrderDetailResult } from '../../../application/ports/inbound/get-order-detail.query';

export interface ReadQueryPort {
  getOrderDetail(orderId: string): Promise<GetOrderDetailResult | null>;
}
export const READ_QUERY_PORT = Symbol('READ_QUERY_PORT');
