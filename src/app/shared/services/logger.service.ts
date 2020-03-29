import { Injectable } from '@angular/core';
import { Constants } from '../models/constants';

@Injectable()
export class LoggerService {
  // tslint:disable: no-console

  // tslint:disable-next-line: no-empty
  constructor() { }

  /**
   * @summary - log error to the browser console
   * @param {error} error - the error that will be logged.
   */
  public error(pError: Error): void {
    console.error(`${Constants.cNAME}:  ${pError.name} ${Constants.cMESSAGE}:  ${pError.message}  ${Constants.cSTACK_TRACE}:  ${pError.stack}`);
  }

  public info(pMessage: string) {
    console.log(`INFORMATION: ${pMessage}`);
  }
}
