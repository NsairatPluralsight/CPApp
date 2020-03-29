import { Injectable } from '@angular/core';
import { CommunicationService } from './communication.service';
import { LoggerService } from './logger.service';
import { ResponsePayload } from '../models/response-payload';
import { Message } from '../models/message';
import { Result, Direction } from '../models/enum';
import { Counter } from '../models/counter';
import { Branch } from '../models/branch';
import { CVMComponent } from '../models/cvm-component';
import { Service } from '../models/service';
import { KeyValue } from '../models/key-value';
import { Language } from '../models/language';
import { CVMComponentType } from '../models/cvm-component-type';
import { Filter } from '../models/filter';
import { CacheService } from './cache.service';
import { EventsService } from './events.service';
import { Constants } from '../models/constants';
import { Permission } from '../models/permission';
import { ServerPayload } from '../models/server-payload';
import { RequestPayload } from '../models/request-payload';

@Injectable()
export class CommunicationManagerService {

  constructor(private communicationService: CommunicationService, private logger: LoggerService,
              private cache: CacheService, private events: EventsService) { }

  /**
   * @async
   * @summary - get user permetion for component
   */
  public async getUserPermission() {
    try {
      const tPayload = this.getServerPayload(`${Constants.cCOMPONENT}.${Constants.cGET_USER_PERMISSION}`, null);
      let tPermission: Permission;

      await this.communicationService
        .post(tPayload, `${Constants.cCVM_SERVER}${Constants.cSLASH}${Constants.cGET_USER_PERMISSION}`)
        .then((data: Message) => {
          if (data && data.payload) {
            const tResponsePayload = data.payload as ResponsePayload;

            if (tResponsePayload.result === Result.Success) {
              const tObject = tResponsePayload.data[0];
              tPermission = new Permission(tObject[Constants.cCREATE], tObject[Constants.cREAD], tObject[Constants.cEDIT],
                tObject[Constants.cDELETE], tObject[Constants.cREPORT]);
            } else {
              tPermission = null;
            }
          } else {
            tPermission = null;
          }
        });
      return tPermission;
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
  public async getBranches(): Promise<Branch[]> {
    try {
      const tFiltersArray = [];
      const tFilter = new KeyValue(Constants.cOrg_ID, '1');
      tFiltersArray.push(tFilter);

      const tReadEntitiesParams = [JSON.stringify(tFiltersArray), this.cache.getCurrentLanguage().id];
      const tPayload = this.getServerPayload(Constants.cQUEUE_BRANCH_GET_ENTITIES_NAMES, tReadEntitiesParams);
      let tBranches = new Array<Branch>();
      await this.communicationService
        .post(tPayload, `${Constants.cCVM_SERVER}${Constants.cSLASH}${Constants.cGET_BRANCHES}`)
        .then((data: Message) => {
          if (data && data.payload) {
            const tResponsePayload = data.payload as ResponsePayload;

            if (tResponsePayload.result === Result.Success) {
              tBranches = tResponsePayload.data[0].map((b) => {
                return (new Branch(b[Constants.cID], b[Constants.cNAME_UCC]));
              });
            } else if (tResponsePayload.result === -3) {
              this.events.unAuthorizedAction.emit(Constants.cBRANCHE);
              tBranches = null;
            } else {
              tBranches = null;
            }
          } else {
            tBranches = null;
          }
        });
      return tBranches;
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
  public async getComponent(pBranchID: number, pTypeName?: string, pDeviceID?: number, pPageNumber?: number, pOrderBy?: string, pFilter?: Filter): Promise<CVMComponent[]> {
    try {
      const tPayload = this.getRequestPayload(pBranchID, pTypeName, pDeviceID, null, pPageNumber, pOrderBy, pFilter);
      let tComponents = new Array<CVMComponent>();
      await this.communicationService
        .post(tPayload, `${Constants.cCOMPONENT_SERVICE}${Constants.cSLASH}${Constants.cMANAGER_GET_COMPONENT}`)
        .then((data: Message) => {
          if (data && data.payload) {
            const tResponsePayload = data.payload as ResponsePayload;
            if (tResponsePayload.result === Result.Success) {
              tComponents = JSON.parse(tResponsePayload.data) as CVMComponent[];
              tComponents.map((device) => {
                if (device.configuration) { device.configuration = JSON.parse(device.configuration); }
                if (device.reportedData) { device.reportedData = JSON.parse(device.reportedData); }
              });
            } else {
              tComponents = null;
            }
          } else {
            tComponents = null;
          }
        });
      return tComponents;
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
  public async getComponentsCount(pBranchID: number, pTypeName?: string): Promise<number> {
    try {
      const tPayload = this.getRequestPayload(pBranchID, pTypeName);
      let tCount = 0;
      await this.communicationService
        .post(tPayload, `${Constants.cCOMPONENT_SERVICE}${Constants.cSLASH}${Constants.cMANAGER_GET_COMPONENTS_COUNT}`)
        .then((data: Message) => {
          if (data && data.payload) {
            const tResponsePayload = data.payload as ResponsePayload;
            if (tResponsePayload.result === Result.Success) {
              const tObject = JSON.parse(tResponsePayload.data)[0];
              tCount = tObject[Constants.cCount];
            } else {
              tCount = null;
            }
          } else {
            tCount = null;
          }
        });
      return tCount;
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
  public async getComponentTypes(): Promise<CVMComponentType[]> {
    try {
      const tPayload = this.getRequestPayload();
      let tComponentTypes = new Array<CVMComponentType>();
      await this.communicationService
        .post(tPayload, `${Constants.cCOMPONENT_SERVICE}${Constants.cSLASH}${Constants.cMANAGER_GET_COMPONENT_TYPE}`)
        .then((data: Message) => {
          if (data && data.payload) {
            const tResponsePayload = data.payload as ResponsePayload;
            if (tResponsePayload.result === Result.Success) {
              tComponentTypes = JSON.parse(tResponsePayload.data) as CVMComponentType[];
            } else {
              tComponentTypes = null;
            }
          } else {
            tComponentTypes = null;
          }
        });
      return tComponentTypes;
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
  public async getCounters(branchID: number): Promise<Counter[]> {
    try {
      const tFiltersArray = [];
      let tFilter = new KeyValue(Constants.cOrg_ID, '1');
      tFiltersArray.push(tFilter);
      tFilter = new KeyValue(Constants.cQUEUE_BRANCH_ID, branchID.toString());
      tFiltersArray.push(tFilter);

      const tReadEntitiesParams = [JSON.stringify(tFiltersArray)];
      const tPayload = this.getServerPayload(Constants.cCOUNTER_READ_ENTITIES, tReadEntitiesParams);
      let tCounters = new Array<Counter>();
      await this.communicationService
        .post(tPayload, `${Constants.cCVM_SERVER}${Constants.cSLASH}${Constants.cGET_COUNTERS}`)
        .then((data: Message) => {
          if (data && data.payload) {
            const tResponsePayload = data.payload as ResponsePayload;

            if (tResponsePayload.result === Result.Success) {
              tCounters = tResponsePayload.data[0].map((c) => {
                return (new Counter(c[Constants.cID], c[Constants.cNUMBER], Direction.None, false, c[Constants.cNAME_L1],
                  c[Constants.cNAME_L2], c[Constants.cNAME_L3], c[Constants.cNAME_L4]));
              });
            } else if (tResponsePayload.result === -3) {
              this.events.unAuthorizedAction.emit(Constants.cCOUNTER);
              tCounters = null;
            } else {
              tCounters = null;
            }
          } else {
            tCounters = null;
          }
        });
      return tCounters;
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
  public async getServicesIDs(branchID: number): Promise<number[]> {
    try {
      const tFiltersArray = [];
      let tFilter = new KeyValue(Constants.cOrg_ID, '1');
      tFiltersArray.push(tFilter);
      tFilter = new KeyValue(Constants.cOBJECT_ID_1, branchID.toString());
      tFiltersArray.push(tFilter);

      const tReadEntitiesParams = [JSON.stringify(tFiltersArray)];
      const tPayload = this.getServerPayload(Constants.cQUEUE_BRANCH_SERVICES_READ_ENTITIES, tReadEntitiesParams);
      let tServicesIDs = new Array<number>();
      await this.communicationService.post(tPayload, Constants.cCVM_SERVER + Constants.cSLASH).then((data: Message) => {
        if (data && data.payload) {
          const tResponsePayload = data.payload as ResponsePayload;

          if (tResponsePayload.result === Result.Success) {
            tServicesIDs = tResponsePayload.data[0].map((b) => {
              return b[Constants.cOBJECT_ID_2];
            });
          } else if (tResponsePayload.result === -3) {
            this.events.unAuthorizedAction.emit(Constants.cSERVICE);
            tServicesIDs = null;
          } else {
            tServicesIDs = null;
          }
        } else {
          tServicesIDs = null;
        }
      });
      return tServicesIDs;
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
  public async getServices(pServicesIDs: number[]): Promise<Service[]> {
    try {
      const tUser = this.cache.getUser();
      const tReadEntitiesParams = [JSON.stringify(pServicesIDs), this.cache.getCurrentLanguage().id, tUser.userId];
      const tPayload = this.getServerPayload(Constants.cSERVICES_GET_ENTITIES_NAMES, tReadEntitiesParams);
      let tServices = new Array<Service>();
      await this.communicationService.post(tPayload, `${Constants.cCVM_SERVER}${Constants.cSLASH}${Constants.cGET_SERVICES}`)
        .then((data: Message) => {
          if (data && data.payload) {
            const tResponsePayload = data.payload as ResponsePayload;

            if (tResponsePayload.result === Result.Success) {
              tServices = tResponsePayload.data[0].map((s) => {
                return (new Service(s[Constants.cID], s[Constants.cNAME_UCC], false));
              });
            } else if (tResponsePayload.result === -3) {
              this.events.unAuthorizedAction.emit(Constants.cSERVICE);
              tServices = null;
            } else {
              tServices = null;
            }
          } else {
            tServices = null;
          }
        });
      return tServices;
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
  public async saveSettings(pDeviceID: number, pType: string, pData: string): Promise<Result> {
    try {
      let result = Result.Failed;
      const tPayload = this.getRequestPayload(0, pType, pDeviceID, pData);
      await this.communicationService
        .post(tPayload, `${Constants.cCOMPONENT_SERVICE}${Constants.cSLASH}${Constants.cCONFIGURATION_SET_CONFIG}`)
        .then((data: Message) => {
          if (data && data.payload) {
            const tResponsePayload = data.payload as ResponsePayload;

            if (tResponsePayload.result === Result.Success) {
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
  public async loadFile(filePath: string): Promise<any> {
    try {
      const tFile = await this.communicationService.getFile(filePath);
      return tFile;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - returns the languages of this organization
   * @returns {Promise<Language[]>} - array of Language wrapped in a promise.
   */
  public async loadLanguages(): Promise<Language[]> {
    try {
      let tLanguages: Language[];
      const tPayload = this.getServerPayload(Constants.cORGANIZATION_LANGUAGES_GET_LANGUAGES, null);

      await this.communicationService
        .anonymousPost(tPayload, `${Constants.cCVM_SERVER}${Constants.cSLASH}${Constants.cGET_LANGUAGES}`)
        .then((data: Message) => {
          if (data && data.payload) {
            const tResponsePayload = data.payload as ResponsePayload;
            if (tResponsePayload.result === Result.Success) {
              const tOrgsLangs = tResponsePayload.data[0];
              tLanguages = tOrgsLangs.find((p) => p.orgId === 1).languages;
            } else if (tResponsePayload.result === -3) {
              this.events.unAuthorized.emit();
              tLanguages = null;
            } else {
              tLanguages = null;
            }
          } else {
            tLanguages = null;
          }
        });
      return tLanguages;
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
  public async executeCommand(pDeviceID: number, pType: string, pData: string): Promise<Result> {
    try {
      let tResult = Result.Failed;
      const tCommanData = JSON.stringify({ command: pData });
      const tPayload = this.getRequestPayload(0, pType, pDeviceID, tCommanData);
      await this.communicationService
        .post(tPayload, `${Constants.cCOMPONENT_SERVICE}${Constants.cSLASH}${Constants.cMANAGER_EXECUTE_COMMAND}`)
        .then((data: Message) => {
          if (data && data.payload) {
            const tResponsePayload = data.payload as ResponsePayload;
            tResult = tResponsePayload.result;
          }
        });
      return tResult;
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
  private getRequestPayload(pBranchID?: number, pType?: string, pDeviceID?: number, pData?: string, pPageNumber?: number, pOrderBy?: string, pFilter?: Filter): RequestPayload {
    try {
      const tPayload = new RequestPayload();
      tPayload.orgID = 1;
      tPayload.typeName = pType;
      tPayload.branchID = pBranchID;
      tPayload.componentID = pDeviceID;
      tPayload.data = pData;
      tPayload.pageNumber = pPageNumber;
      tPayload.orderBy = pOrderBy;
      tPayload.limit = 250;
      tPayload.filter = pFilter ? JSON.stringify(pFilter) : null;
      return tPayload;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   *
   * @param target
   * @param data
   */
  private getServerPayload(pTarget, pData): ServerPayload {
    try {
      const tPayload = new ServerPayload();
      tPayload.target = pTarget;
      tPayload.data = pData ? JSON.stringify(pData) : JSON.stringify(new Array<any>());

      return tPayload;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
