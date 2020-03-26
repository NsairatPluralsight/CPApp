import { Injectable } from '@angular/core';
import { LoggerService } from '../shared/services/logger.service';
import { Result } from '../shared/models/enum';
import { CVMComponent } from '../shared/models/cvm-component';
import { Counter } from '../shared/models/counter';
import { CommunicationManagerService } from '../shared/services/communication-manager.service';
import { CounterLCDConfiguration } from '../shared/models/counter-lcd-configuration';
import { Constants } from '../shared/models/constants';

@Injectable()
export class CounterLCDService {
  counters: Counter[];
  counterLCD: CVMComponent;
  counterLCDConfiguration: CounterLCDConfiguration;
  constructor(private logger: LoggerService, private communicationManager: CommunicationManagerService) { }

  /**
   * @async
   * @summary - initialize the data needed for the counter LCD component
   * @param {number} id - the ID of the component
   * @returns {Promise<Result>} - Result wrapped in a promise.
   */
  async getSettings(id: number): Promise<Result> {
    try {

      this.counterLCD = (await this.communicationManager.getComponent(0, null, id))[0];

      if (this.counterLCD) {
        this.counters = await this.communicationManager.getCounters(this.counterLCD.queueBranch_ID);

        if (this.counters && this.counters.length > 0) {

          let result = await this.prepareConfiguration();
          return result;

        } else {
          return Result.Failed;
        }
      } else {
        return Result.Failed;
      }
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }

  /**
   * @async
   * @summary - set ot intilize the counter LCD configurations
   * @returns {Promise<Result>} - Result wrapped in a promise.
   */
  async prepareConfiguration(): Promise<Result> {
    try {

      if (this.counterLCD.configuration) {
        this.counterLCDConfiguration = <CounterLCDConfiguration>this.counterLCD.configuration;
      } else {
        this.counterLCDConfiguration = new CounterLCDConfiguration(0);
      }

      return Result.Success;
    }
    catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }

  /**
   * @async
   * @summary - save the component configuration
   * @param {number} id - the ID of the component
   * @param {CounterLCDConfiguration} configuration - counter LCd configuration
   * @returns {Promise<Result>} - Result wrapped in a promise.
   */
  async setConfiguration(id: number, configuration: CounterLCDConfiguration): Promise<Result> {
    try {
      let result = await this.communicationManager.saveSettings(id, Constants.cCOUNTER_LCD, JSON.stringify(configuration));

      return result;
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }

  /**
   * @async
   * @summary - send a text to the component to identify it
   * @param {number} id - the ID of the component
   * @returns {Promise<Result>} - Result wrapped in a promise.
   */
  async identify(id: number): Promise<Result> {
    try {
      let result = await this.communicationManager.executeCommand(id, Constants.cCOUNTER_LCD, Constants.cHELLO);
      return result;
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }
}
