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
  public counters: Counter[];
  public counterLCD: CVMComponent;
  public counterLCDConfiguration: CounterLCDConfiguration;
  constructor(private logger: LoggerService, private communicationManager: CommunicationManagerService) { }

  /**
   * @async
   * @summary - initialize the data needed for the counter LCD component
   * @param {number} pID - the ID of the component
   * @returns {Promise<Result>} - Result wrapped in a promise.
   */
  public async getSettings(pID: number): Promise<Result> {
    try {
      this.counterLCD = (await this.communicationManager.getComponent(0, null, pID))[0];

      if (this.counterLCD) {
        this.counters = await this.communicationManager.getCounters(this.counterLCD.queueBranch_ID);

        if (this.counters && this.counters.length > 0) {

          const tResult = await this.prepareConfiguration();
          return tResult;
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
  public async prepareConfiguration(): Promise<Result> {
    try {
      if (this.counterLCD.configuration) {
        this.counterLCDConfiguration =  this.counterLCD.configuration as CounterLCDConfiguration;
      } else {
        this.counterLCDConfiguration = new CounterLCDConfiguration(0);
      }
      return Result.Success;
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }

  /**
   * @async
   * @summary - save the component configuration
   * @param {number} pID - the ID of the component
   * @param {CounterLCDConfiguration} configuration - counter LCd configuration
   * @returns {Promise<Result>} - Result wrapped in a promise.
   */
  public async setConfiguration(pID: number, pConfiguration: CounterLCDConfiguration): Promise<Result> {
    try {
      const tResult = await this.communicationManager.saveSettings(pID, Constants.cCOUNTER_LCD, JSON.stringify(pConfiguration));
      return tResult;
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
  public async identify(pID: number): Promise<Result> {
    try {
      const tResult = await this.communicationManager.executeCommand(pID, Constants.cCOUNTER_LCD, Constants.cHELLO);
      return tResult;
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }
}
