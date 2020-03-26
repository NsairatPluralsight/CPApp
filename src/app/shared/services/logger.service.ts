import { Injectable } from '@angular/core';
import { Constants } from '../models/constants';

@Injectable()
export class LoggerService {

  constructor() { }

  /**
  * @summary - log error to the browser console
  * @param {error} error - the error that will be logged.
  */
  error(error: Error): void {
    console.error(`${Constants.cNAME}:  ${error.name} ${Constants.cMESSAGE}:  ${error.message}  ${Constants.cSTACK_TRACE}:  ${error.stack}`);
  }

  info(message: string) {
    console.log(`INFORMATION: ${message}`);
  }
}
