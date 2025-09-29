import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrderController } from './application/ports/inbound/http/order-controller';
import { CREATE_ORDER_USECASE } from './application/ports/inbound/create-order.usecase';
import { CreateOrderService } from './application/use-cases/create-order.service';
import { CANCEL_ORDER_USECASE } from './application/ports/inbound/cancel-order.usecase';
import { ORDER_REPOSITORY } from './application/ports/outbound/order-repository.port';
import { InMemoryOrderRepository } from './infrastructure/adapters/outbound/in-memory-order.repository';
import { UNIT_OF_WORK } from './application/ports/outbound/unit-of-work.port';
import { OUTBOX_PORT } from './application/ports/outbound/outbox.port';
import { InMemoryUnitOfWork } from './infrastructure/adapters/outbound/in-memory-unit.work';
import { InMemoryOutbox } from './infrastructure/adapters/outbound/in-memory.outbox';
import { CancelOrderService } from './application/use-cases/cancel-order.service';

@Module({
  imports: [],
  controllers: [OrderController],
  providers: [
    // inbound ports -> implementations
    { provide: CREATE_ORDER_USECASE, useClass: CreateOrderService },
    { provide: CANCEL_ORDER_USECASE, useClass: CancelOrderService },
    // { provide: GET_ORDER_DETAIL_USECASE, useClass: GetOrderDetailService },

    // outbound ports -> adapters
    { provide: ORDER_REPOSITORY, useClass: InMemoryOrderRepository },
    { provide: UNIT_OF_WORK, useClass: InMemoryUnitOfWork },
    { provide: OUTBOX_PORT, useClass: InMemoryOutbox },
  ],
})
export class AppModule {}
