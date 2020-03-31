import { Injectable } from '@angular/core';
import { CommunicationManagerService } from '../../shared/services/communication-manager.service';
import { LoggerService } from 'src/app/shared/services/logger.service';
import { Counter } from 'src/app/shared/models/counter';
import { Result, CountersOption, MainLCDDisplayMode } from 'src/app/shared/models/enum';
import { CVMComponent } from 'src/app/shared/models/cvm-component';
import { MainLCDConfiguration } from 'src/app/shared/models/main-lcd-configuration';
import { Service } from 'src/app/shared/models/service';
import { Constants } from 'src/app/shared/models/constants';
import { UICVMComponent } from 'src/app/shared/models/ui-cvm-component';
import { CommonActionsService } from 'src/app/shared/services/common-actions.service';
import { MainLCDCounter } from 'src/app/shared/models/main-lcd-counter';

@Injectable()
export class MainLCDService {
  public counters: Counter[];
  public services: Service[];
  public mainLCD: CVMComponent;
  public mainLCDUI: UICVMComponent;
  public mainLCDConfiguration: MainLCDConfiguration;
  public idleTimeForPaging = 30;
  public pageDuration = 10;
  constructor(private communicationManager: CommunicationManagerService, private logger: LoggerService,
              private commonService: CommonActionsService) { }

  /**
   * @async
   * @summary - initialize the data needed for the main LCD component
   * @param {number} mainLCDID - the ID of the component
   * @returns {Promise<Result>} - Result wrapped in a promise.
   */
  public async getSettings(pMainLCDID: number, pLanguageIndex: string): Promise<Result> {
    let tResult =  Result.Failed;
    try {
      this.mainLCD = (await this.communicationManager.getComponent(0, Constants.cMAIN_LCD, pMainLCDID))[0];

      if (this.mainLCD) {

        this.mainLCDUI = new UICVMComponent(this.mainLCD.id, this.mainLCD.typeName, this.mainLCD['name_L' + pLanguageIndex],
        this.mainLCD.identity, this.mainLCD.address, this.commonService.getBranch(this.mainLCD.queueBranch_ID).name);

        this.counters = await this.communicationManager.getCounters(this.mainLCD.queueBranch_ID);

        if (this.counters && this.counters.length > 0) {
          const tServicesIDs = await this.communicationManager.getServicesIDs(this.mainLCD.queueBranch_ID);

          if (tServicesIDs && tServicesIDs.length > 0) {
            this.services = await this.communicationManager.getServices(tServicesIDs);

            if (this.services && this.services.length > 0) {
              tResult = await this.prepareConfiguration();
            }
          }
        }
      }
      return tResult;
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }

  /**
   * @async
   * @summary - save the component configuration
   * @param {number} mainLCDID - the ID of the component
   * @param {MainLCDConfiguration} configuration - main LCD configuration
   * @returns {Promise<Result>} - Result wrapped in a promise.
   */
  public async setConfiguration(pMainLCDID: number, pConfiguration: MainLCDConfiguration): Promise<Result> {
    try {
      pConfiguration = await this.filterConfiguration(pConfiguration);
      const tResult = await this.communicationManager.saveSettings(pMainLCDID, Constants.cMAIN_LCD, JSON.stringify(pConfiguration));
      return tResult;
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }

  /**
   * @async
   * @summary - send a text to the component to identify it
   * @param {number} mainLCDID - the ID of the component
   * @returns {Promise<Result>} - Result wrapped in a promise.
   */
  public async identify(pMainLCDID: number): Promise<Result> {
    try {
      const tResult = await this.communicationManager.executeCommand(pMainLCDID, Constants.cMAIN_LCD, Constants.cHELLO);
      return tResult;
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }

  /**
   * @async
   * @summary - modify the counter and the services for View
   * @returns {Promise<Result>} - Result wrapped in a promise.
   */
  public async prepareConfiguration(): Promise<Result> {
    try {
      if (this.mainLCD.configuration) {
        this.mainLCDConfiguration = this.mainLCD.configuration as MainLCDConfiguration;
      } else {
        this.mainLCDConfiguration = new MainLCDConfiguration(MainLCDDisplayMode.CurrentCustomer, false, false, this.idleTimeForPaging, this.pageDuration, CountersOption.All);
      }

      if (this.mainLCDConfiguration.counters.length > 0) {
        this.counters.forEach((element) => {
          const tIndex = this.mainLCDConfiguration.counters.map((counter) => counter.id).indexOf(element.id);

          if (tIndex !== -1) {
            element.assigned = true;
            element.direction = this.mainLCDConfiguration.counters[tIndex].direction;
          }
        });
      }

      this.mainLCDConfiguration.counters = this.counters;

      if (this.mainLCDConfiguration.services.length > 0) {
        this.services.forEach((element) => {
          const tIndex = this.mainLCDConfiguration.services.indexOf(element.id);
          if (tIndex !== -1) {
            element.assigned = true;
          }
        });
      }
      this.mainLCDConfiguration.services = this.services;
      return Result.Success;
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }

  /**
   * @async
   * @summary - change the counters and services from type to another for saving
   * @param {MainLCDConfiguration} configuration -
   */
  public async filterConfiguration(pConfiguration: MainLCDConfiguration): Promise<MainLCDConfiguration> {
    try {
      if (pConfiguration.counters.length > 0) {
        pConfiguration.counters = pConfiguration.counters.map((counter) => new MainLCDCounter(counter.id, counter.direction));
      }

      if (pConfiguration.services.length > 0) {
        pConfiguration.services = pConfiguration.services.map((service) => service.id );
      }

      return pConfiguration;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }
}
