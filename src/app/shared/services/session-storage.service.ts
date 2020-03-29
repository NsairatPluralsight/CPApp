import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';
import { EventsService } from './events.service';
import { Guid } from '../models/guid';

@Injectable({
  providedIn: 'root',
})
export class SessionStorageService {
  public storageEvent: string = 'storage';
  public getUserInitialDataFromOtherTabsEvent: string = 'getUserInitialData';
  public userInitialDataAvailableEvent: string = 'userInitialData';
  public userLoginDataAvailableEvent: string = 'userLogin';
  public userLogoutDataAvailableEvent: string = 'userLogout';
  public userRefreshDataAvailableEvent: string = 'userUpdate';

  // given for the current tab to identify where the storage event is raised from, and ignore own events
  public guid: string;

  constructor(private logger: LoggerService, private eventService: EventsService) {
    this.guid = new Guid(logger).getGuid();
    this.startStorageListener();
  }

  /**
   * @summary - store or remove data from session Storage
   * @param key - a label of the data you want to save or remove
   * @param value - the data or null
   */
  public storeData(pKey: string, pValue: any): void {
    if (pValue) {
      pValue = JSON.stringify(pValue);
      sessionStorage.setItem(pKey, pValue);
    } else {
      sessionStorage.removeItem(pKey);
    }
  }

  /**
   * @summary - return the data if available
   * @param key - a label of the data you want to retrieve
   * @returns {any} - null or data
   */
  public getData(pKey: string): any {
    try {
      const tItem = sessionStorage.getItem(pKey);
      if (tItem) {
        return JSON.parse(tItem);
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
  public getDataFromOtherTabs(): void {
    try {
      localStorage.setItem(this.getUserInitialDataFromOtherTabsEvent, this.guid);
      localStorage.removeItem(this.getUserInitialDataFromOtherTabsEvent);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - set session event so other tabs copy the session
   */
  public raiseUserSessionDataAvailable(): void {
    try {
      localStorage.setItem(this.userInitialDataAvailableEvent, JSON.stringify({ sessionStorage, source: this.guid }));
      localStorage.removeItem(this.userInitialDataAvailableEvent);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - set session event so other tabs logout
   */
  public raiseUserLogout(): void {
    try {
      localStorage.setItem(this.userLogoutDataAvailableEvent, JSON.stringify({ sessionStorage, source: this.guid }));
      localStorage.removeItem(this.userLogoutDataAvailableEvent);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - set session event so other tabs login
   */
  public raiseUserLogin(): void {
    try {
      localStorage.setItem(this.userLoginDataAvailableEvent, JSON.stringify({ sessionStorage, source: this.guid }));
      localStorage.removeItem(this.userLoginDataAvailableEvent);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - set session event so other copy the refresh token
   */
  public raiseUserTokenRefreshed(): void {
    try {
      localStorage.setItem(this.userRefreshDataAvailableEvent, JSON.stringify({ sessionStorage, source: this.guid }));
      localStorage.removeItem(this.userRefreshDataAvailableEvent);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - handles the session storage events
   * @param event - session storage event
   */
  public storageEventListener(pEvent: StorageEvent): void {
    try {
      if (pEvent.key === this.getUserInitialDataFromOtherTabsEvent) {
        // Some tab asked for the sessionStorage other than this tab -> send it by raising userSessionStorage event
        if (pEvent.newValue !== this.guid) {
          this.raiseUserSessionDataAvailable();
        } else {
          this.eventService.loadDataDone.emit(true);
        }
      } else if (pEvent.key === this.userInitialDataAvailableEvent
        || pEvent.key === this.userLoginDataAvailableEvent
        || pEvent.key === this.userLogoutDataAvailableEvent
        || pEvent.key === this.userRefreshDataAvailableEvent) {

        // update session storage from other tabs on login, open new tab, logout, token refresh
        const tData = JSON.parse(pEvent.newValue);

        if (tData && tData.source !== this.guid && tData.sessionStorage && this.isDifferentSessionStorage(tData.sessionStorage)) {

          // tslint:disable-next-line: forin
          for (const tKey in tData.sessionStorage) {
            this.storeData(tKey, JSON.parse(tData.sessionStorage[tKey]));
            if (pEvent.key === this.userInitialDataAvailableEvent) {
              this.eventService.loadDataDone.emit(true);
            } else if (pEvent.key === this.userLogoutDataAvailableEvent) {
              this.eventService.logoutUser.emit();
            } else if (pEvent.key === this.userLoginDataAvailableEvent) {
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
  public isDifferentSessionStorage(pNewSessionStorage): boolean {
    try {
      if (sessionStorage && pNewSessionStorage) {
        if (sessionStorage.length !== pNewSessionStorage.length) {
          return true;
        }
        for (const key in pNewSessionStorage) {
          if (sessionStorage[key] === pNewSessionStorage[key]) {
            continue;
          } else {
            return true;
          }
        }
      }
      return false;
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
}
