import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import {
  CREATE_ORDER_USECASE,
  CreateOrderCommand,
  CreateOrderUseCase,
} from '../create-order.usecase';
import {
  CANCEL_ORDER_USECASE,
  CancelOrderUseCase,
} from '../cancel-order.usecase';
import {
  GET_ORDER_DETAIL_USECASE,
  GetOrderDetailUseCase,
} from '../get-order-detail.query';

@Controller('orders')
export class OrderController {
  constructor(
    @Inject(CREATE_ORDER_USECASE)
    private readonly createOrder: CreateOrderUseCase,
    @Inject(CANCEL_ORDER_USECASE)
    private readonly cancelOrder: CancelOrderUseCase,
    @Inject(GET_ORDER_DETAIL_USECASE)
    private readonly getOrderDetail: GetOrderDetailUseCase,
  ) {}

  @Post()
  async create(@Body() body: CreateOrderCommand) {
    return this.createOrder.execute(body);
  }

  @Post(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @Body() body: { expectedVersion: number },
  ) {
    await this.cancelOrder.execute({
      orderId: id,
      expectedVersion: body.expectedVersion,
    });
    return { ok: true };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const row = await this.getOrderDetail.execute({ orderId: id });
    if (!row) throw new NotFoundException('Order not found in read model');
    return row;
  }
}
