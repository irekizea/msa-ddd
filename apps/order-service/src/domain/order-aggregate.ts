export type OrderItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};
export type OrderStatus = 'CREATED' | 'PAID' | 'CANCELLED';
export type Currency = 'KRW' | 'USD' | 'EUR';

export class Order {
  private _id: string;
  private _customerId: string;
  private _status: OrderStatus = 'CREATED';
  private _currency: Currency;
  private _items: OrderItem[] = [];
  private _totalAmount = 0;
  private _version = 1;

  private constructor(id: string, customerId: string, currency: Currency) {
    this._id = id;
    this._customerId = customerId;
    this._currency = currency;
  }

  static create(customerId: string, currency: Currency) {
    const id = crypto.randomUUID();
    return new Order(id, customerId, currency);
  }

  addItem(productId: string, quantity: number, unitPrice: number) {
    if (this._status !== 'CREATED')
      throw new Error('Cannot modify items after payment/cancel');
    if (quantity <= 0) throw new Error('quantity > 0');
    if (unitPrice < 0) throw new Error('unitPrice >= 0');
    this._items.push({
      productId,
      quantity,
      unitPrice,
      lineTotal: quantity * unitPrice,
    });
  }

  computeTotals() {
    this._totalAmount = this._items.reduce((s, i) => s + i.lineTotal, 0);
  }

  cancel() {
    if (this._status === 'PAID') throw new Error('Cannot cancel a paid order');
    this._status = 'CANCELLED';
    this._version += 1;
  }

  // getters
  id() {
    return this._id;
  }
  customerId() {
    return this._customerId;
  }
  currency() {
    return this._currency;
  }
  items() {
    return this._items.slice();
  }
  totalAmount() {
    return this._totalAmount;
  }
  status() {
    return this._status;
  }
  version() {
    return this._version;
  }

  // rehydrate (infra can use this)
  static fromPrimitives(p: {
    id: string;
    customerId: string;
    currency: Currency;
    status: OrderStatus;
    items: OrderItem[];
    totalAmount: number;
    version: number;
  }) {
    const o = new Order(p.id, p.customerId, p.currency);
    o._items = p.items;
    o._totalAmount = p.totalAmount;
    o['_status'] = p.status;
    o['_version'] = p.version;
    return o;
  }
  toPrimitives() {
    return {
      id: this._id,
      customerId: this._customerId,
      currency: this._currency,
      status: this._status,
      items: this._items,
      totalAmount: this._totalAmount,
      version: this._version,
    };
  }

  private static canTransition(from: OrderStatus, to: OrderStatus): boolean {
    const allowed: Record<OrderStatus, OrderStatus[]> = {
      CREATED: ['PAID', 'CANCELLED'],
      PAID: [], // e.g. cannot move out of PAID (refund is separate flow)
      CANCELLED: [], // terminal
    };
    return allowed[from].includes(to);
  }

  changeStatus(to: OrderStatus) {
    if (!Order.canTransition(this._status, to)) {
      throw new Error(`Illegal status transition ${this._status} -> ${to}`);
    }
    this._status = to;
    this._version += 1;
  }
}
