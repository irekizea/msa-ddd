import { ReadQueryPort } from '../../../src/infrastructure/adapters/outbound/read-query.port';
import { GetOrderDetailService } from '../../../src/application/use-cases/get-order-detail.service';

class FakeReadRepo implements ReadQueryPort {
  data = new Map<string, any>();
  getOrderDetail(id: string) {
    return Promise.resolve(this.data.get(id) ?? null);
  }
}

describe('GetOrderDetailService', () => {
  // it('returns projection when present', async () => {
  //   const repo = new FakeReadRepo();
  //   repo.data.set('o1', {
  //     orderId: 'o1',
  //     customerId: 'c',
  //     status: 'CREATED',
  //     currency: 'KRW',
  //     totalAmount: 0,
  //     items: [],
  //     version: 1,
  //   });
  //   const svc = new GetOrderDetailService(repo);
  //   const row = await svc.execute({ orderId: 'o1' });
  //   expect(row?.orderId).toBe('o1');
  // });
  // it('returns null when missing', async () => {
  //   const repo = new FakeReadRepo();
  //   const svc = new GetOrderDetailService(repo);
  //   expect(await svc.execute({ orderId: 'x' })).toBeNull();
  // });
});
