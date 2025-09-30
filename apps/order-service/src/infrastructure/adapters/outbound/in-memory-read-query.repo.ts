import { Injectable } from '@nestjs/common';
import { GetOrderDetailResult } from '../../../application/ports/inbound/get-order-detail.query';
import { ReadQueryPort } from './read-query.port';

// simple in-memory projection cache (for demo)
@Injectable()
export class InMemoryReadQueryRepo implements ReadQueryPort {
  private views = new Map<string, GetOrderDetailResult>();
  // Expose a way to seed from write repo in tests if needed
  seed(view: GetOrderDetailResult) {
    this.views.set(view.orderId, view);
  }
  getOrderDetail(orderId: string) {
    return Promise.resolve(this.views.get(orderId) ?? null);
  }
}
