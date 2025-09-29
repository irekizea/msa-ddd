import { Injectable, Logger } from '@nestjs/common';
import { OutboxPort } from '../../../application/ports/outbound/outbox.port';
import { TransactionContext } from '../../../application/ports/outbound/order-repository.port';

@Injectable()
export class InMemoryOutbox implements OutboxPort {
  private log = new Logger('Outbox');
  private events: any[] = [];

  async append(
    eventType: string,
    key: string,
    payload: any,
    version: number,
    _tx: TransactionContext,
  ): Promise<void> {
    this.events.push({
      eventType,
      key,
      version,
      payload,
      occurredAt: new Date().toISOString(),
    });
    this.log.debug(`Appended ${eventType} key=${key} v=${version}`);
  }

  // exposed only for tests / inspection
  all() {
    return this.events.slice();
  }
}
