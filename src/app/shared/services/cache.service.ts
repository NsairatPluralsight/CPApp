import { Injectable } from '@angular/core';
import { Language } from '../models/language';
import { Cache } from '../models/cache';
import { AuthenticatedUser } from '../models/user';
import { LoggerService } from './logger.service';
import { SessionStorageService } from './session-storage.service';
import { Constants } from '../models/constants';
import { Permission } from '../models/permission';

@Injectable({ providedIn: 'root' })
export class CacheService {
  cache: Cache;

  constructor(private logger: LoggerService, private sessionService: SessionStorageService) {
    this.cache = new Cache();
  }

  /**
   * @summary - cache user info in service and session storage
   * @param {AuthenticatedUser} user - the user info to cache
   */
  setUser(user: AuthenticatedUser): void {
    try {
      if (user) {        
        this.cache.user = user;
      } else {
        this.cache.user = null;
      }
      this.sessionService.storeData(`${Constants.cSESSION_PREFIX}${Constants.cUSER}`, user);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - returns the user info if available
   * @returns {any} - user info or null
   */
  getUser(): AuthenticatedUser {
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
  setlanguages(languages: Language[]): void {
    try {
      if (languages) {
        this.cache.languages = languages;
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
  getLanguages(): Language[] {
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
  setCurrentLanguage(language: Language): void {
    try {
      if (language) {
        this.cache.currentLanguage = language;
        this.sessionService.storeData(`${Constants.cSESSION_PREFIX}${Constants.cCURRENT_LANGUAGE}`, language);
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
  getCurrentLanguage(): any {
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
  setPermission(permission: Permission): void {
    try {
      if (permission) {
        this.cache.user.permission = permission;
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
  getPermission(): Permission {
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
  setIsDiffrentUser(isDiffrentUser: boolean) {
    try {
      this.sessionService.storeData(`${Constants.cSESSION_PREFIX}${Constants.cIS_DIFFRENT_USER}`, isDiffrentUser);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - returns whether user trys to login with diffrent user or not
   * @returns {boolean}
   */
  getIsDiffrentUser(): boolean {
    try {
      return this.sessionService.getData(`${Constants.cSESSION_PREFIX}${Constants.cIS_DIFFRENT_USER}`);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
