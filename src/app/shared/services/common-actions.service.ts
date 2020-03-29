import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';
import { MultilingualService } from './multilingual.service';
import { LoginErrorCodes, Error, PermissionType } from '../models/enum';
import { Constants } from '../models/constants';
import { CommunicationManagerService } from './communication-manager.service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class CommonActionsService {

  constructor(private logger: LoggerService, private multillingualService: MultilingualService,
              private communicationManager: CommunicationManagerService, private cache: CacheService) { }

  /**
   * @summary - get the caption for specific error
   * @param {number} errorCode - the error number
   * @returns {string} - the caption
   */
  public getErrorCaption(errorCode: number): string {
    try {
      let tKey = Constants.cERROR_GENERAL;
      switch (errorCode) {
        case LoginErrorCodes.UserInactive:
          tKey = Constants.cERROR_EMPLOYEE_NOT_ACTIVE;
          break;
        case LoginErrorCodes.UserLocked:
          tKey = Constants.cERROR_EMPLOYEE_LOCKED;
          break;
        case LoginErrorCodes.PasswordExpired:
          tKey = Constants.cERROR_PASSWORD_EXPIRED;
          break;
        case LoginErrorCodes.UnauthorizedLogin:
          tKey = Constants.cERROR_UNAUTHORIZED_LOGIN;
          break;
        case LoginErrorCodes.InvalidUsername:
        case LoginErrorCodes.InvalidPassword:
        case LoginErrorCodes.InvalidLoginData:
          tKey = Constants.cERROR_INVALID_LOGIN_DATA;
          break;
        case Error.NotAllowed:
          tKey = Constants.cERROR_NOT_ALLOWed;
        case Error.Disconnected:
          tKey = Constants.cERROR_DISCONNECTED;
          break;
      }
      return this.multillingualService.getCaption(tKey);
    } catch (error) {
      this.logger.error(error);
      return this.multillingualService.getCaption(Constants.cERROR_GENERAL);
    }
  }

  /**
   * @async
   * @summary - get user Permission from server and check if he got read
   * @returns {Promise<boolean>} - boolean wrapped in a promise.
   */
  public async checkUserPermission(): Promise<boolean> {
    try {
      let tResult = false;
      const tPermission = await this.communicationManager.getUserPermission();

      if (tPermission) {
        this.cache.setPermission(tPermission);
        tResult = tPermission.read;
      }
      return tResult;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - check if specific permission is available or not
   * @param {PermissionType} type - the Permission Type to check
   * @returns {boolean} - the caption
   */
  public async checkPermission(type: PermissionType): Promise<boolean> {
    try {
      let tResult = false;
      const permission = await this.cache.getPermission();

      if (permission) {
        switch (type) {
          case PermissionType.Create:
            tResult = permission.create;
            break;
          case PermissionType.Edit:
            tResult = permission.edit;
            break;
          case PermissionType.Read:
            tResult = permission.read;
            break;
          case PermissionType.Report:
            tResult = permission.report;
            break;
          case PermissionType.Delete:
            tResult = permission.delete;
            break;
        }
      }
      return tResult;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
}
