import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';
import { MultilingualService } from './multilingual.service';
import { LoginErrorCodes, Error, PermissionType } from '../models/enum';
import { Constants } from '../models/constants';
import { CommunicationManagerService } from './communication-manager.service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class CommonActionsService {

  constructor(private logger: LoggerService, private multillingualService: MultilingualService,
    private communicationManager: CommunicationManagerService, private cache: CacheService) { }

  /**
   * @summary - get the caption for specific error
   * @param {number} errorCode - the error number
   * @returns {string} - the caption
   */
  getErrorCaption(errorCode: number): string {
    try {
      let key = Constants.cERROR_GENERAL;
      switch (errorCode) {
        case LoginErrorCodes.UserInactive:
          key = Constants.cERROR_EMPLOYEE_NOT_ACTIVE;
          break;
        case LoginErrorCodes.UserLocked:
          key = Constants.cERROR_EMPLOYEE_LOCKED;
          break;
        case LoginErrorCodes.PasswordExpired:
          key = Constants.cERROR_PASSWORD_EXPIRED;
          break;
        case LoginErrorCodes.UnauthorizedLogin:
          key = Constants.cERROR_UNAUTHORIZED_LOGIN;
          break;
        case LoginErrorCodes.InvalidUsername:
        case LoginErrorCodes.InvalidPassword:
        case LoginErrorCodes.InvalidLoginData:
          key = Constants.cERROR_INVALID_LOGIN_DATA;
          break;
        case Error.NotAllowed:
          key = Constants.cERROR_NOT_ALLOWed;
        case Error.Disconnected:
          key = Constants.cERROR_DISCONNECTED;
          break;
      }
      return this.multillingualService.getCaption(key);
    } catch (error) {
      this.logger.error(error);
      let key = Constants.cERROR_GENERAL;
      return this.multillingualService.getCaption(key);
    }
  }

  /**
   * @async
   * @summary - get user Permission from server and check if he got read
   * @returns {Promise<boolean>} - boolean wrapped in a promise.
   */
  async checkUserPermission(): Promise<boolean> {
    try {
      let result = false;
      let permission = await this.communicationManager.getUserPermission();

      if (permission) {
        this.cache.setPermission(permission);
        result = permission.read
      }

      return result
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
  * @summary - check if specific permission is available or not
  * @param {PermissionType} type - the Permission Type to check
  * @returns {boolean} - the caption
  */
  async checkPermission(type: PermissionType): Promise<boolean> {
    try {
      let result = false;
      let permission = await this.cache.getPermission();

      if (permission) {
        switch (type) {
          case PermissionType.Create:
            result = permission.create;
            break;
          case PermissionType.Edit:
            result = permission.edit;
            break;
          case PermissionType.Read:
            result = permission.read;
            break;
          case PermissionType.Report:
            result = permission.report;
            break;
          case PermissionType.Delete:
            result = permission.delete;
            break;
        }
      }
      return result
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
}
