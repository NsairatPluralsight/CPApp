import { Injectable } from '@angular/core';
import { CVMComponent } from '../shared/models/cvm-component';
import { CommunicationManagerService } from '../shared/services/communication-manager.service';
import { LoggerService } from '../shared/services/logger.service';
import { Branch } from '../shared/models/branch';
import { CVMComponentType } from '../shared/models/cvm-component-type';
import { Result } from '../shared/models/enum';
import { Filter } from '../shared/models/filter';

@Injectable()
export class CVMComponentsService {
  branches: Branch[];
  types: CVMComponentType[];
  component: CVMComponent[];
  count: number;

  constructor(private communicationManager: CommunicationManagerService, private logger: LoggerService) { }

  /**
   * @async
   * @summary - get the data to initialize the cvm-components component
   * @returns {Promise<Result>} - Result wrapped in a promise.
   */
  async initialize(): Promise<Result> {
    try {
      let branchID = 0;
      this.branches = await this.communicationManager.getBranches();
      if(!this.branches || this.branches.length <= 0) {
        this.logger.error(new Error('couldnt get branches'));
        branchID= -1;
      }

      this.types = await this.communicationManager.getComponentTypes();
      if(!this.types || this.types.length <= 0) {
        return Result.Failed;
      }

      let result = await this.getCount(branchID);

      return result;
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }

  /**
   * @async
   * @summary - get the count of the cvm-components
   * @param {number} branchID - the id of branch that the component belongs
   * @param {string} typeName - optional the type of components
   * @returns {Promise<Result>} - Result wrapped in a promise.
   */
  async getCount(branchID: number, typeName?: string): Promise<Result> {
    try {
      this.count = await this.communicationManager.getComponentsCount(branchID, typeName);
      if(this.count === null || this.count === undefined) {
        return Result.Failed;
      }
      return Result.Success;
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }

  /**
   * @async
   * @summary - get the count of the cvm-components
   * @param {number} branchID - branch ID
   * @param {string} typeName - component type
   * @param {number} deviceID - component ID
   * @param {number} pageNumber - in pagging page number
   * @param {string} orderBy - the column name and the direction of sorting
   * @param {Filter} filter - object that contains the text to search for and columns name to search in
   * @returns {Promise<CVMComponent[]>} - array of objects of type CVMComponent wrapped in a promise.
   */
  async getDevices(pageNumber: number, columnName: string, branchID: number, type?: string, filter?: Filter): Promise<CVMComponent[]>  {
    try {
      return await this.communicationManager.getComponent(branchID, type, null, pageNumber, columnName, filter);
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }
}
