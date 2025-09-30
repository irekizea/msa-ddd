import { Order } from '../../../src/domain/order-aggregate';

describe('OrderAggregate (domain)', () => {
  it('creates order, adds items, computes totals', () => {
    const o = Order.create('cust_1', 'KRW');
    o.addItem('p1', 2, 1000);
    o.addItem('p2', 1, 500);
    o.computeTotals();
    expect(o.totalAmount()).toBe(2500);
    expect(o.items()).toHaveLength(2);
    expect(o.status()).toBe('CREATED');
    expect(o.version()).toBe(1);
  });

  it('prevents modifying items after cancel', () => {
    const o = Order.create('cust', 'KRW');
    o.addItem('p', 1, 100);
    o.computeTotals();
    o.cancel();
    expect(() => o.addItem('q', 1, 10)).toThrow(/Cannot modify items/);
  });

  it('prevents cancel for PAID orders', () => {
    // Hydrate a PAID order
    const paid = Order.fromPrimitives({
      id: crypto.randomUUID(),
      customerId: 'c',
      status: 'PAID',
      currency: 'KRW',
      items: [],
      totalAmount: 0,
      version: 3,
    });
    expect(() => paid.cancel()).toThrow(/Cannot cancel a paid order/);
  });

  it('allows legal status transitions, blocks illegal ones', () => {
    const o = Order.create('c', 'KRW');
    // add domain method via fromPrimitives + direct method present in your code
    // CREATED -> PAID (legal)
    (o as any).changeStatus('PAID');
    expect(o.status()).toBe('PAID');
    // PAID -> CANCELLED (illegal in our policy)
    expect(() => (o as any).changeStatus('CANCELLED')).toThrow(
      /Illegal status transition/,
    );
  });
});
