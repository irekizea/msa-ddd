import { Injectable, Inject } from '@nestjs/common';
import {
    CreateOrderCommand,
    CreateOrderResult,
    CreateOrderUseCase
} from "../ports/inbound/create-order.usecase";
import { ORDER_REPOSITORY, OrderRepositoryPort, TransactionContext } from '../ports/outbound/order-repository.port';
import { UNIT_OF_WORK, UnitOfWorkPort } from '../ports/outbound/unit-of-work.port';
import { OUTBOX_PORT, OutboxPort } from '../ports/outbound/outbox.port';
import { Order } from '../../domain/OrderAggregate';
import {it} from "node:test";

@Injectable()
export class CreateOrderService implements CreateOrderResult, CreateOrderUseCase {
    constructor(
        @Inject(ORDER_REPOSITORY) private readonly orders: OrderRepositoryPort,
        @Inject(UNIT_OF_WORK) private readonly uow: UnitOfWorkPort,
        @Inject(OUTBOX_PORT) private readonly outbox: OutboxPort,

    ) {}


    async execute(cmd: CreateOrderCommand): Promise<CreateOrderResult> {
        return this.uow.withTransaction<CreateOrderResult>(async (tx: TransactionContext) => {
            const order = Order.create(cmd.customerId,  cmd.currency);
            for (const it of cmd.items) {
                order.addItem(it.productId, it.quantity, it.unitPrice);
            }
            order.computeTotals();

            // expectedVersion=0 for brandnew aggregate
            await this.orders.save(order, 0, tx);

            // append outbox event (published by a background publisher)
            await this.outbox.append('order.created', order.id(), {
                orderId: order.id(),
                customerId: order.customerId(),
                currency: order.currency(),
                totalAmount: order.totalAmount(),
                items: order.items().map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice, lineTotal: i.lineTotal })),
                version: order.version(),
                occurredAt: new Date().toISOString(),
            }, tx);

            return { orderId: order.id() };
        });
    }

    orderId: string;
}
