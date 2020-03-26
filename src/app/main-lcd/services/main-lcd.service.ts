import { Injectable } from '@angular/core';
import { CommunicationManagerService } from '../../shared/services/communication-manager.service';
import { LoggerService } from 'src/app/shared/services/logger.service';
import { Counter, MainLCDCounter } from 'src/app/shared/models/counter';
import { Result, CountersOption, MainLCDDisplayMode } from 'src/app/shared/models/enum';
import { CVMComponent } from 'src/app/shared/models/cvm-component';
import { MainLCDConfiguration } from 'src/app/shared/models/main-lcd-configuration';
import { Service } from 'src/app/shared/models/service';
import { Constants } from 'src/app/shared/models/constants';
import { Branch } from 'src/app/shared/models/branch';
import { promise } from 'protractor';

@Injectable()
export class MainLCDService {
  counters: Counter[];
  services: Service[];
  mainLCD: CVMComponent;
  mainLCDConfiguration: MainLCDConfiguration;
  branch: Branch;
  idleTimeForPaging = 30;
  pageDuration = 10;
  constructor(private communicationManager: CommunicationManagerService, private logger: LoggerService) { }

  /**
   * @async
   * @summary - initialize the data needed for the main LCD component
   * @param {number} mainLCDID - the ID of the component
   * @returns {Promise<Result>} - Result wrapped in a promise.
   */
  async getSettings(mainLCDID: number): Promise<Result> {
    try {

      this.mainLCD = (await this.communicationManager.getComponent(0, Constants.cMAIN_LCD, mainLCDID))[0];

      if (this.mainLCD) {

        this.counters = await this.communicationManager.getCounters(this.mainLCD.queueBranch_ID);

        if (this.counters && this.counters.length > 0) {

          let servicesIDs = await this.communicationManager.getServicesIDs(this.mainLCD.queueBranch_ID);

          if (servicesIDs && servicesIDs.length > 0) {
            this.services = await this.communicationManager.getServices(servicesIDs);

            if (this.services && this.services.length > 0) {

              let result = await this.prepareConfiguration();

              if (result == Result.Success) {
                return Result.Success;
              } else {
                return Result.Failed;
              }
            } else {
              return Result.Failed;
            }
          } else {
            return Result.Failed;
          }
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
   * @summary - save the component configuration
   * @param {number} mainLCDID - the ID of the component
   * @param {MainLCDConfiguration} configuration - main LCD configuration
   * @returns {Promise<Result>} - Result wrapped in a promise.
   */
  async setConfiguration(mainLCDID: number, configuration: MainLCDConfiguration): Promise<Result> {
    try {

      configuration = await this.filterConfiguration(configuration);
      let result = await this.communicationManager.saveSettings(mainLCDID, Constants.cMAIN_LCD, JSON.stringify(configuration));

      return result;
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
  async identify(mainLCDID: number): Promise<Result> {
    try {
      let result = await this.communicationManager.executeCommand(mainLCDID, Constants.cMAIN_LCD, Constants.cHELLO);
      return result;
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
  async prepareConfiguration(): Promise<Result> {
    try {

      if (this.mainLCD.configuration) {
        this.mainLCDConfiguration = <MainLCDConfiguration>this.mainLCD.configuration;
      } else {
        this.mainLCDConfiguration = new MainLCDConfiguration(MainLCDDisplayMode.CurrentCustomer, false, false, this.idleTimeForPaging, this.pageDuration, CountersOption.All);
      }

      if (this.mainLCDConfiguration.counters.length > 0) {
        this.counters.forEach(element => {
          let index = this.mainLCDConfiguration.counters.map((counter) => { return counter.id; }).indexOf(element.id);

          if(index != -1) {
            element.assigned = true;
            element.direction = this.mainLCDConfiguration.counters[index].direction;
          }
        });
      }

      this.mainLCDConfiguration.counters = this.counters;

      if (this.mainLCDConfiguration.services.length > 0) {
        this.services.forEach(element => {
          let index = this.mainLCDConfiguration.services.indexOf(element.id);
          if (index != -1) {
            element.assigned = true;
          }
        });
      }
      this.mainLCDConfiguration.services = this.services;

      await this.setBranch(this.mainLCD.queueBranch_ID);

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
  async filterConfiguration(configuration: MainLCDConfiguration):  Promise<MainLCDConfiguration> {
    try {
      if(configuration.counters.length > 0) {
        configuration.counters = configuration.counters.map((counter) => { return new MainLCDCounter(counter.id, counter.direction); });
      }

      if(configuration.services.length > 0) {
        configuration.services = configuration.services.map((service) => { return service.id; } );
      }

      return configuration;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async setBranch(pBranchID: number): Promise<void>  {
    try {
      const branches = await this.communicationManager.getBranches();
      this.branch = branches.find((pBranch) => pBranch.id === pBranchID);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
