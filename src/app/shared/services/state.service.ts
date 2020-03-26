import { Injectable } from '@angular/core';
import { ErrorType, InternalStatus } from '../models/enum';
import { LoggerService } from './logger.service';
import { EventsService } from './events.service';

@Injectable()
export class StateService {
  private status: InternalStatus;
  private errorType: ErrorType;

  constructor(private logger: LoggerService, private eventsService: EventsService) { }

  /**
  * @summary - sets the status of the app
  * @param {Status} value - The status value.
  */
  setStatus(value: InternalStatus, errorType?: ErrorType): void {
    try {
      this.status = value;
      this.eventsService.statusUpdate.emit(value);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * @return {Status} return Status enum that represents the App status.
  */
  getStatus(): InternalStatus {
    try {
      return this.status;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
