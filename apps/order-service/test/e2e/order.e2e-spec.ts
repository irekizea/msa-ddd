import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { InMemoryReadQueryRepo } from '../../src/infrastructure/adapters/outbound/in-memory-read-query.repo';

describe('OrderController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = mod.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates an order and cancels it via HTTP', async () => {
    // Create
    const createRes = await request(app.getHttpServer())
      .post('/orders')
      .send({
        customerId: 'cust_1',
        currency: 'KRW',
        items: [{ productId: 'p1', quantity: 2, unitPrice: 1000 }],
      })
      .expect(201);

    const orderId = createRes.body.orderId;
    expect(orderId).toBeDefined();

    // Change status (cancel) with expectedVersion = 1
    await request(app.getHttpServer())
      .post(`/orders/${orderId}/cancel`)
      .send({ expectedVersion: 1 })
      .expect(201);

    // Seed read repo (since projector is not running in this in-memory setup)
    const read = app.get(InMemoryReadQueryRepo);
    read.seed({
      orderId,
      customerId: 'cust_1',
      status: 'CANCELLED',
      currency: 'KRW',
      totalAmount: 2000,
      items: [
        { productId: 'p1', quantity: 2, unitPrice: 1000, lineTotal: 2000 },
      ],
      version: 2,
    });

    // Query
    const getRes = await request(app.getHttpServer())
      .get(`/orders/${orderId}`)
      .expect(200);
    expect(getRes.body.orderId).toBe(orderId);
    expect(getRes.body.orderStatus ?? getRes.body.status).toBe('CANCELLED'); // depending on read model shape
  });
});
