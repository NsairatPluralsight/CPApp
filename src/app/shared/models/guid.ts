import { v4 as uuid } from 'uuid';
import { LoggerService } from '../services/logger.service';

export class Guid {

  constructor(private logger: LoggerService) { }

  public getGuid(): string {
    try {
      return uuid();
    } catch (error) {
      this.logger.error(error);
      throw (error);
    }
  }
}
