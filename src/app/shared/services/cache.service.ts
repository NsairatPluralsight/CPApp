import { Injectable } from '@angular/core';
import { Language } from '../models/language';
import { Cache } from '../models/cache';
import { LoggerService } from './logger.service';
import { SessionStorageService } from './session-storage.service';
import { Constants } from '../models/constants';
import { Permission } from '../models/permission';
import { Branch } from '../models/branch';
import { AuthenticatedUser } from '../models/authenticated-User';

@Injectable({ providedIn: 'root' })
export class CacheService {
  public cache: Cache;

  constructor(private logger: LoggerService, private sessionService: SessionStorageService) {
    this.cache = new Cache();
  }

  /**
   * @summary - cache user info in service and session storage
   * @param {AuthenticatedUser} user - the user info to cache
   */
  public setUser(pUser: AuthenticatedUser): void {
    try {
      if (pUser) {
        this.cache.user = pUser;
      } else {
        this.cache.user = null;
      }
      this.sessionService.storeData(`${Constants.cSESSION_PREFIX}${Constants.cUSER}`, pUser);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - returns the user info if available
   * @returns {any} - user info or null
   */
  public getUser(): AuthenticatedUser {
    try {
      return this.sessionService.getData(`${Constants.cSESSION_PREFIX}${Constants.cUSER}`);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - cache languages in service
   * @param {Language[]} languages - array of languages
   */
  public setlanguages(pLanguages: Language[]): void {
    try {
      if (pLanguages) {
        this.cache.languages = pLanguages;
      } else {
        this.cache.languages = null;
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - returns the language info if available
   * @returns {Language[]} - array of language
   */
  public getLanguages(): Language[] {
    try {
      return this.cache.languages;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - cache user info in service and session storage
   * @param {Language} language - the Current language of app
   */
  public setCurrentLanguage(pLanguages: Language): void {
    try {
      if (pLanguages) {
        this.cache.currentLanguage = pLanguages;
        this.sessionService.storeData(`${Constants.cSESSION_PREFIX}${Constants.cCURRENT_LANGUAGE}`, pLanguages);
      } else {
        this.cache.currentLanguage = null;
        this.sessionService.storeData(`${Constants.cSESSION_PREFIX}${Constants.cCURRENT_LANGUAGE}`, null);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - returns the Current language if available
   * @returns {any} - language or null
   */
  public getCurrentLanguage(): any {
    try {
      return this.sessionService.getData(`${Constants.cSESSION_PREFIX}${Constants.cCURRENT_LANGUAGE}`);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - cache permission in service
   * @param {Permission} permission
   */
  public setPermission(pPermission: Permission): void {
    try {
      if (pPermission) {
        this.cache.user.permission = pPermission;
      } else {
        this.cache.user.permission = null;
      }
      this.setUser(this.cache.user);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - returns the Permission if available
   * @returns {Permission}
   */
  public getPermission(): Permission {
    try {
      return this.getUser().permission;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - cache user user action login with diffrent user
   * @param {boolean} isDiffrentUser
   */
  public setIsDiffrentUser(pIsDiffrentUser: boolean) {
    try {
      this.sessionService.storeData(`${Constants.cSESSION_PREFIX}${Constants.cIS_DIFFRENT_USER}`, pIsDiffrentUser);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - returns whether user trys to login with diffrent user or not
   * @returns {boolean}
   */
  public getIsDiffrentUser(): boolean {
    try {
      return this.sessionService.getData(`${Constants.cSESSION_PREFIX}${Constants.cIS_DIFFRENT_USER}`);
    } catch (error) {
      this.logger.error(error);
    }
  }

  public setBranches(pBranches: Branch[]): void {
    try {
      this.cache.branches = pBranches;
    } catch (error) {
      this.logger.error(error);
    }
  }

  public getBranches(): Branch[] {
    try {
      return this.cache.branches;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
