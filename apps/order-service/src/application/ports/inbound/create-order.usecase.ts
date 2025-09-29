export type CreateOrderItemDTO = {
    productId: string;
    quantity: number;
    unitPrice: number;
};

export type CreateOrderCommand = {
    customerId: string;
    currency: 'KRW' | 'USD' | 'EUR';
    items: CreateOrderItemDTO[];
};

export type CreateOrderResult = {
    orderId: string;
};

export interface CreateOrderUseCase {
    execute(cmd: CreateOrderCommand): Promise<CreateOrderResult>;
}

// DI token for Nest (avoid importing concrete classes in controllers)
export const CREATE_ORDER_USECASE = Symbol('CREATE_ORDER_USECASE');