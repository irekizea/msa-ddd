import { Inject, Injectable } from '@nestjs/common';
import {
  GET_ORDER_DETAIL_USECASE,
  GetOrderDetailQuery,
  GetOrderDetailResult,
  GetOrderDetailUseCase,
} from '../ports/inbound/get-order-detail.query';
import {
  ORDER_REPOSITORY,
  OrderRepositoryPort,
} from '../ports/outbound/order-repository.port';

@Injectable()
export class GetOrderDetailService implements GetOrderDetailUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly repo: OrderRepositoryPort,
  ) {}

  async execute(q: GetOrderDetailQuery): Promise<GetOrderDetailResult | null> {
    const o = await this.repo.findById(q.orderId);
    if (!o) return null;
    return {
      orderId: o.id(),
      customerId: o.customerId(),
      status: o.status(),
      currency: o.currency(),
      totalAmount: o.totalAmount(),
      items: o.items().map((i) => ({ ...i })),
      version: o.version(),
    };
    // (In a real CQRS read side, this would query a projection instead.)
  }
}
