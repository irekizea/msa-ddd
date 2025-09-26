import { Injectable } from '@nestjs/common';
import { UnitOfWorkPort } from '../../../application/ports/outbound/unit-of-work.port';

@Injectable()
export class InMemoryUnitOfWork implements UnitOfWorkPort {
  async withTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    // No real transaction in-memory; just call the function.
    return fn({} as any);
  }
}
