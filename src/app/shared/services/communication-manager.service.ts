import { Injectable } from '@angular/core';
import { CommunicationService } from './communication.service';
import { LoggerService } from './logger.service';
import { RequestPayload, ResponsePayload, ServerPayload } from '../models/payload';
import { Message } from '../models/message';
import { Result, Direction } from '../models/enum';
import { Counter } from '../models/counter';
import { Branch } from '../models/branch';
import { CVMComponent } from '../models/cvm-component';
import { Service } from '../models/service';
import { keyValue } from '../models/key-value';
import { Language } from '../models/language';
import { CVMComponentType } from '../models/cvm-component-type';
import { Filter } from '../models/filter';
import { CacheService } from './cache.service';
import { EventsService } from './events.service';
import { Constants } from '../models/constants';
import { Permission } from '../models/permission';

@Injectable()
export class CommunicationManagerService {

  constructor(private communicationService: CommunicationService, private logger: LoggerService,
    private cache: CacheService, private events: EventsService) { }

  /**
  * @async
  * @summary - get user permetion for component
  */
  async getUserPermission() {
    try {
      let payload = this.getServerPayload(`${Constants.cCOMPONENT}.${Constants.cGET_USER_PERMISSION}`, null);
      let permission: Permission;

      await this.communicationService
        .post(payload, `${Constants.cCVM_SERVER}${Constants.cSLASH}${Constants.cGET_USER_PERMISSION}`)
        .then((data: Message) => {
          if (data && data.payload) {
            let responsePayload = <ResponsePayload>data.payload;

            if (responsePayload.result == Result.Success) {
              let object = responsePayload.data[0];
              permission = new Permission(object[Constants.cCREATE], object[Constants.cREAD], object[Constants.cEDIT],
                 object[Constants.cDELETE], object[Constants.cREPORT]);
            } else {
              permission = null;
            }
          } else {
            permission = null;
          }
        });
      return permission;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  /**
  * @async
  * @summary - returns all the branches that belongs to an organization
  * @returns {Promise<Branch[]>} - array of objects of type Branch wrapped in a promise.
  */
  async getBranches(): Promise<Branch[]> {
    try {
      let filtersArray = [];
      let filter = new keyValue(Constants.cOrg_ID, '1');
      filtersArray.push(filter);

      let readEntitiesParams = [JSON.stringify(filtersArray), this.cache.getCurrentLanguage().id];
      let payload = this.getServerPayload(Constants.cQUEUE_BRANCH_GET_ENTITIES_NAMES, readEntitiesParams);
      let branches = new Array<Branch>();
      await this.communicationService
        .post(payload, `${Constants.cCVM_SERVER}${Constants.cSLASH}${Constants.cGET_BRANCHES}`)
        .then((data: Message) => {
          if (data && data.payload) {
            let responsePayload = <ResponsePayload>data.payload;

            if (responsePayload.result == Result.Success) {
              branches = responsePayload.data[0].map(b => {
                return (new Branch(b[Constants.cID], b[Constants.cNAME_UCC]));
              });
            } else if (responsePayload.result == -3) {
              this.events.unAuthorizedAction.emit(Constants.cBRANCHE);
              branches = null;
            } else {
              branches = null;
            }
          } else {
            branches = null;
          }
        });
      return branches;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  /**
   * @async
   * @summary - get one or more components accourding to the paramters
   * @param {number} branchID - branch ID
   * @param {string} typeName - component type
   * @param {number} deviceID - component ID
   * @param {number} pageNumber - in pagging page number
   * @param {string} orderBy - the column name and the direction of sorting
   * @param {Filter} filter - object that contains the text to search for and columns name to search in
   * @returns {Promise<CVMComponent[]>} - array of objects of type CVMComponent wrapped in a promise.
   */
  async getComponent(branchID: number, typeName?: string, deviceID?: number, pageNumber?: number, orderBy?: string, filter?: Filter): Promise<CVMComponent[]> {
    try {
      let payload = this.getRequestPayload(branchID, typeName, deviceID, null, pageNumber, orderBy, filter);
      let components = new Array<CVMComponent>();
      await this.communicationService
        .post(payload, `${Constants.cCOMPONENT_SERVICE}${Constants.cSLASH}${Constants.cMANAGER_GET_COMPONENT}`)
        .then((data: Message) => {
          if (data && data.payload) {
            let responsePayload = <ResponsePayload>data.payload;
            if (responsePayload.result == Result.Success) {
              components = <CVMComponent[]>JSON.parse(responsePayload.data);
              components.map((device) => {
                if (device.configuration) { device.configuration = JSON.parse(device.configuration); }
                if (device.reportedData) { device.reportedData = JSON.parse(device.reportedData); }
              })
            } else {
              components = null;
            }
          } else {
            components = null;
          }
        });
      return components;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  /**
  * @async
  * @summary - returns Components Count  accourding to paramters
  * @param {number} branchID -the branch ID
  * @param {string} typeName - the component Type
  * @returns {Promise<number>} - number wrapped in a promise.
  */
  async getComponentsCount(branchID: number, typeName?: string): Promise<number> {
    try {
      let payload = this.getRequestPayload(branchID, typeName);
      let count = 0;
      await this.communicationService
        .post(payload, `${Constants.cCOMPONENT_SERVICE}${Constants.cSLASH}${Constants.cMANAGER_GET_COMPONENTS_COUNT}`)
        .then((data: Message) => {
          if (data && data.payload) {
            let responsePayload = <ResponsePayload>data.payload;
            if (responsePayload.result == Result.Success) {
              let object = JSON.parse(responsePayload.data)[0];
              count = object[Constants.cCount];
            } else {
              count = null;
            }
          } else {
            count = null;
          }
        });
      return count;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  /**
  * @async
  * @summary - returns Component types
  * @returns {Promise<CVMComponentType[]>} - array of objects of type CVMComponentType wrapped in a promise.
  */
  async getComponentTypes(): Promise<CVMComponentType[]> {
    try {
      let payload = this.getRequestPayload();
      let componentTypes = new Array<CVMComponentType>();
      await this.communicationService
        .post(payload, `${Constants.cCOMPONENT_SERVICE}${Constants.cSLASH}${Constants.cMANAGER_GET_COMPONENT_TYPE}`)
        .then((data: Message) => {
          if (data && data.payload) {
            let responsePayload = <ResponsePayload>data.payload;
            if (responsePayload.result == Result.Success) {
              componentTypes = <CVMComponentType[]>JSON.parse(responsePayload.data);
            } else {
              componentTypes = null;
            }
          } else {
            componentTypes = null;
          }
        });
      return componentTypes;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  /**
   * @async
   * @summary - returns counters that belongs to branch
   * @param {number} branchID - the branch ID
   * @returns {Promise<Counter[]>} - array of objects of type Counter wrapped in a promise.
   */
  async getCounters(branchID: number): Promise<Array<Counter>> {
    try {
      let filtersArray = [];
      let filter = new keyValue(Constants.cOrg_ID, '1');
      filtersArray.push(filter);
      filter = new keyValue(Constants.cQUEUE_BRANCH_ID, branchID.toString());
      filtersArray.push(filter);

      let readEntitiesParams = [JSON.stringify(filtersArray)];
      let payload = this.getServerPayload(Constants.cCOUNTER_READ_ENTITIES, readEntitiesParams);
      let counters = new Array<Counter>();
      await this.communicationService
        .post(payload, `${Constants.cCVM_SERVER}${Constants.cSLASH}${Constants.cGET_COUNTERS}`)
        .then((data: Message) => {
          if (data && data.payload) {
            let responsePayload = <ResponsePayload>data.payload;

            if (responsePayload.result == Result.Success) {
              counters = responsePayload.data[0].map((c) => {
                return (new Counter(c[Constants.cID], c[Constants.cNUMBER], Direction.None, false, c[Constants.cNAME_L1],
                  c[Constants.cNAME_L2], c[Constants.cNAME_L3], c[Constants.cNAME_L4]));
              });
            } else if (responsePayload.result == -3) {
              this.events.unAuthorizedAction.emit(Constants.cCOUNTER);
              counters = null;
            } else {
              counters = null;
            }
          } else {
            counters = null;
          }
        });
      return counters;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  /**
   * @async
   * @summary - returns ServicesIDs that belongs to branch
   * @param {number} branchID - the branch ID
   * @returns {Promise<number[]>} - array of numbers wrapped in a promise.
   */
  async getServicesIDs(branchID: number): Promise<Array<number>> {
    try {
      let filtersArray = [];
      let filter = new keyValue(Constants.cOrg_ID, '1');
      filtersArray.push(filter);
      filter = new keyValue(Constants.cOBJECT_ID_1, branchID.toString());
      filtersArray.push(filter);

      let readEntitiesParams = [JSON.stringify(filtersArray)];
      let payload = this.getServerPayload(Constants.cQUEUE_BRANCH_SERVICES_READ_ENTITIES, readEntitiesParams);
      let servicesIDs = new Array<number>();
      await this.communicationService.post(payload, Constants.cCVM_SERVER + Constants.cSLASH).then((data: Message) => {
        if (data && data.payload) {
          let responsePayload = <ResponsePayload>data.payload;

          if (responsePayload.result == Result.Success) {
            servicesIDs = responsePayload.data[0].map(b => {
              return b[Constants.cOBJECT_ID_2];
            });
          } else if (responsePayload.result == -3) {
            this.events.unAuthorizedAction.emit(Constants.cSERVICE);
            servicesIDs = null;
          }
          else {
            servicesIDs = null;
          }
        } else {
          servicesIDs = null;
        }
      });
      return servicesIDs;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  /**
   * @async
   * @summary - returns services for the sent IDs
   * @param {Array<number>} servicesIDs - the ids of services to retrieve
   * @returns {Promise<Service[]>} - array of Service wrapped in a promise.
   */
  async getServices(servicesIDs: Array<number>): Promise<Array<Service>> {
    try {

      let user = this.cache.getUser();
      let readEntitiesParams = [JSON.stringify(servicesIDs), this.cache.getCurrentLanguage().id, user.userId];
      let payload = this.getServerPayload(Constants.cSERVICES_GET_ENTITIES_NAMES, readEntitiesParams);
      let services = new Array<Service>();
      await this.communicationService.post(payload, `${Constants.cCVM_SERVER}${Constants.cSLASH}${Constants.cGET_SERVICES}`)
        .then((data: Message) => {
          if (data && data.payload) {
            let responsePayload = <ResponsePayload>data.payload;

            if (responsePayload.result == Result.Success) {
              services = responsePayload.data[0].map(s => {
                return (new Service(s[Constants.cID], s[Constants.cNAME_UCC], false));
              });
            } else if (responsePayload.result == -3) {
              this.events.unAuthorizedAction.emit(Constants.cSERVICE);
              services = null;
            } else {
              services = null;
            }
          } else {
            services = null;
          }
        });
      return services;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  /**
   * @async
   * @summary - send configuration that belongs to a specific component
   * @param {number} deviceID - the component ID
   * @param {string} type - component type
   * @param {string} data - component configuration
   * @returns {Promise<Result>} - Result wrapped in a promise.
   */
  async saveSettings(deviceID: number, type: string, data: string): Promise<Result> {
    try {
      let result = Result.Failed;
      let payload = this.getRequestPayload(0, type, deviceID, data);
      await this.communicationService
        .post(payload, `${Constants.cCOMPONENT_SERVICE}${Constants.cSLASH}${Constants.cCONFIGURATION_SET_CONFIG}`)
        .then((data: Message) => {
          if (data && data.payload) {
            let responsePayload = <ResponsePayload>data.payload;

            if (responsePayload.result == Result.Success) {
              result = Result.Success;
            }
          }
        });
      return result;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - returns file as string
   * @param {string} filePath - the path the contains the file
   * @returns {Promise<any>} - string as any wrapped in a promise.
   */
  async loadFile(filePath: string): Promise<any> {
    try {
      let file = await this.communicationService.getFile(filePath);
      return file;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - returns the languages of this organization
   * @returns {Promise<Language[]>} - array of Language wrapped in a promise.
   */
  async loadLanguages(): Promise<Array<Language>> {
    try {
      let languages: Language[];
      let payload = this.getServerPayload(Constants.cORGANIZATION_LANGUAGES_GET_LANGUAGES, null);

      await this.communicationService
        .anonymousPost(payload, `${Constants.cCVM_SERVER}${Constants.cSLASH}${Constants.cGET_LANGUAGES}`)
        .then((data: Message) => {
          if (data && data.payload) {
            let responsePayload = <ResponsePayload>data.payload;
            if (responsePayload.result == Result.Success) {
              let orgsLangs = responsePayload.data[0];
              languages = orgsLangs.find(p => p.orgId === 1).languages;
            } else if (responsePayload.result == -3) {
              this.events.unAuthorized.emit();
              languages = null;
            } else {
              languages = null;
            }
          } else {
            languages = null;
          }
        });

      return languages;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  /**
   * @async
   * @summary - send a comman to a specific component
   * @param {number} deviceID - component ID
   * @param {string} type - component type
   * @param {string} data - command as string
   * @returns {Promise<Result>} - Result wrapped in a promise.
   */
  async executeCommand(deviceID: number, type: string, data: string): Promise<Result> {
    try {
      let result = Result.Failed;
      let commanData = JSON.stringify({ command: data });
      let payload = this.getRequestPayload(0, type, deviceID, commanData);
      await this.communicationService
        .post(payload, `${Constants.cCOMPONENT_SERVICE}${Constants.cSLASH}${Constants.cMANAGER_EXECUTE_COMMAND}`)
        .then((data: Message) => {
          if (data && data.payload) {
            let responsePayload = <ResponsePayload>data.payload;
            result = responsePayload.result;
          }
        });
      return result;
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }

  /**
   *
   * @param pBranchID
   * @param pType
   * @param pDeviceID
   * @param pData
   * @param pPageNumber
   * @param pOrderBy
   * @param filter
   */
  private getRequestPayload(pBranchID?: number, pType?: string, pDeviceID?: number, pData?: string, pPageNumber?: number, pOrderBy?: string, filter?: Filter): RequestPayload {
    try {
      let payload = new RequestPayload();
      payload.orgID = 1;
      payload.typeName = pType;
      payload.branchID = pBranchID;
      payload.componentID = pDeviceID;
      payload.data = pData;
      payload.pageNumber = pPageNumber;
      payload.orderBy = pOrderBy;
      payload.limit = 250;
      payload.filter = filter ? JSON.stringify(filter) : null;
      return payload;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   *
   * @param target
   * @param data
   */
  private getServerPayload(target, data): ServerPayload {
    try {
      let payload = new ServerPayload();
      payload.target = target;
      payload.data = data ? JSON.stringify(data): JSON.stringify(new Array<any>());

      return payload;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
