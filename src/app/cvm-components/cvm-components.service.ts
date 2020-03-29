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
  public branches: Branch[];
  public types: CVMComponentType[];
  public component: CVMComponent[];
  public count: number;

  constructor(private communicationManager: CommunicationManagerService, private logger: LoggerService) { }

  /**
   * @async
   * @summary - get the data to initialize the cvm-components component
   * @returns {Promise<Result>} - Result wrapped in a promise.
   */
  public async initialize(): Promise<Result> {
    try {
      let tBranchID = 0;
      this.branches = await this.communicationManager.getBranches();
      if (!this.branches || this.branches.length <= 0) {
        this.logger.error(new Error('couldnt get branches'));
        tBranchID = -1;
      }

      this.types = await this.communicationManager.getComponentTypes();
      if (!this.types || this.types.length <= 0) {
        return Result.Failed;
      }

      const tResult = await this.getCount(tBranchID);
      return tResult;
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
  public async getCount(pBranchID: number, pTypeName?: string): Promise<Result> {
    try {
      this.count = await this.communicationManager.getComponentsCount(pBranchID, pTypeName);
      if (this.count === null || this.count === undefined) {
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
  public async getDevices(pPageNumber: number, pColumnName: string, pBranchID: number, pType?: string, pFilter?: Filter): Promise<CVMComponent[]>  {
    try {
      return await this.communicationManager.getComponent(pBranchID, pType, null, pPageNumber, pColumnName, pFilter);
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }
}
