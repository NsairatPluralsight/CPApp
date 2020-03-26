import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';
import { EventsService } from './events.service';
import { Guid } from '../models/guid';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {
  storageEvent: string = "storage";
  getUserInitialDataFromOtherTabsEvent: string = "getUserInitialData";
  userInitialDataAvailableEvent: string = "userInitialData";
  userLoginDataAvailableEvent: string = "userLogin";
  userLogoutDataAvailableEvent: string = "userLogout";
  userRefreshDataAvailableEvent: string = "userUpdate";

  //given for the current tab to identify where the storage event is raised from, and ignore own events
  guid: string;

  constructor(private logger: LoggerService, private eventService: EventsService) {
    this.guid = new Guid(logger).getGuid();
    this.startStorageListener();
  }

  /**
   * @summary - store or remove data from session Storage
   * @param key - a label of the data you want to save or remove
   * @param value - the data or null
   */
  public storeData(key: string, value: any): void {
    if (value) {
      value = JSON.stringify(value);
      sessionStorage.setItem(key, value);
    }
    else {
      sessionStorage.removeItem(key);
    }
  }

  /**
   * @summary - return the data if available
   * @param key - a label of the data you want to retrieve
   * @returns {any} - null or data
   */
  public getData(key: string): any {
    try {
      let item = sessionStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
      return null;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  /**
   * @summary - set session event to get setion from another tab
   */
  getDataFromOtherTabs(): void {
    try {
      localStorage.setItem(this.getUserInitialDataFromOtherTabsEvent, this.guid);
      localStorage.removeItem(this.getUserInitialDataFromOtherTabsEvent);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - add listener to session storage events
   */
  private async startStorageListener(): Promise<void> {
    try {
      window.removeEventListener(this.storageEvent, this.storageEventListener.bind(this));
      window.addEventListener(this.storageEvent, this.storageEventListener.bind(this));
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - set session event so other tabs copy the session
   */
  raiseUserSessionDataAvailable(): void {
    try {
      localStorage.setItem(this.userInitialDataAvailableEvent, JSON.stringify({ sessionStorage: sessionStorage, source: this.guid }));
      localStorage.removeItem(this.userInitialDataAvailableEvent);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - set session event so other tabs logout
   */
  raiseUserLogout(): void {
    try {
      localStorage.setItem(this.userLogoutDataAvailableEvent, JSON.stringify({ sessionStorage: sessionStorage, source: this.guid }));
      localStorage.removeItem(this.userLogoutDataAvailableEvent);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
 * @summary - set session event so other tabs login
 */
  raiseUserLogin(): void {
    try {
      localStorage.setItem(this.userLoginDataAvailableEvent, JSON.stringify({ sessionStorage: sessionStorage, source: this.guid }));
      localStorage.removeItem(this.userLoginDataAvailableEvent);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - set session event so other copy the refresh token
   */
  raiseUserTokenRefreshed(): void {
    try {
      localStorage.setItem(this.userRefreshDataAvailableEvent, JSON.stringify({ sessionStorage: sessionStorage, source: this.guid }));
      localStorage.removeItem(this.userRefreshDataAvailableEvent);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - handles the session storage events
   * @param event - session storage event
   */
  storageEventListener(event: StorageEvent): void {
    try {
      if (event.key == this.getUserInitialDataFromOtherTabsEvent) {
        // Some tab asked for the sessionStorage other than this tab -> send it by raising userSessionStorage event
        if (event.newValue !== this.guid) {
          this.raiseUserSessionDataAvailable();
        }
        else {
          this.eventService.loadDataDone.emit(true);
        }
      } else if (event.key === this.userInitialDataAvailableEvent
        || event.key === this.userLoginDataAvailableEvent
        || event.key === this.userLogoutDataAvailableEvent
        || event.key === this.userRefreshDataAvailableEvent) {

        //update session storage from other tabs on login, open new tab, logout, token refresh
        var data = JSON.parse(event.newValue);

        if (data && data.source !== this.guid && data.sessionStorage && this.isDifferentSessionStorage(data.sessionStorage)) {

          for (var key in data.sessionStorage) {
            this.storeData(key, JSON.parse(data.sessionStorage[key]));
            if (event.key === this.userInitialDataAvailableEvent) {
              this.eventService.loadDataDone.emit(true);
            } else if (event.key === this.userLogoutDataAvailableEvent) {
              this.eventService.logoutUser.emit();
            } else if (event.key === this.userLoginDataAvailableEvent) {
              this.eventService.loginUser.emit();
            }
          }
        }
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - check if there is deffrence between the session
   * @param newSessionStorage - the session copied from another tab
   */
  isDifferentSessionStorage(newSessionStorage): boolean {
    try {
      if (sessionStorage && newSessionStorage) {
        if (sessionStorage.length !== newSessionStorage.length) {
          return true;
        }
        for (var key in newSessionStorage) {
          if (sessionStorage[key] === newSessionStorage[key]) {
            continue;
          }
          else {
            return true;
          }
        }
      }
      return false
    } catch (error) {
      this.logger.error(error);
    }
  }
}
