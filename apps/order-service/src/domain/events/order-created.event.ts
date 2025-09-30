export type OrderCreated = {
  eventId: string;
  orderId: string;
  customerId: string;
  currency: 'KRW' | 'USD' | 'EUR';
  totalAmount: number;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  version: number;
  occurredAt: string;
};
