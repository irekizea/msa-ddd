export type OrderStatusChanged = {
  eventId: string;
  orderId: string;
  status: 'CREATED' | 'PAID' | 'CANCELLED';
  version: number;
  occurredAt: string;
};
