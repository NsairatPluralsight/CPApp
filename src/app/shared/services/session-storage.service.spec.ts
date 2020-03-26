import { TestBed } from '@angular/core/testing';
import { SessionStorageService } from './session-storage.service';
import { EventEmitter } from '@angular/core';
import { EventsService } from './events.service';
import { LoggerService } from './logger.service';
import { Language } from '../models/language';
import { Guid } from '../models/guid';
import { AuthenticatedUser } from '../models/user';

describe('SessionStorageService', () => {
  let service: SessionStorageService;
  let mockLoggerservice, mockEventsService;

  mockEventsService = {
    loadDataDone: new EventEmitter(),
    logoutUser: new EventEmitter(),
    loginUser: new EventEmitter()
  };

  mockEventsService.loadDataDone = new EventEmitter();
  mockEventsService.logoutUser = new EventEmitter();
  mockEventsService.loginUser = new EventEmitter();

  beforeEach(() => {
    mockLoggerservice = jasmine.createSpyObj(['error', 'info']);

    TestBed.configureTestingModule({
      providers: [SessionStorageService,
        { provide: EventsService, useValue: mockEventsService },
        { provide: LoggerService, useValue: mockLoggerservice }
      ]
    });

    service = TestBed.get(SessionStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('storeData', () => {
    it('should store language', () => {
      let language = new Language();
      language.id = 1;
      language.caption = "English";

      service.storeData('language', language);

      let storedLang = JSON.parse(sessionStorage.getItem('language'));

      expect(storedLang['id']).toBe(language.id);
    });

    it('should remove language', () => {
      let language = new Language();
      language.id = 1;
      language.caption = "English";

      service.storeData('language', language);
      service.storeData('language', null);

      let storedLang = sessionStorage.getItem('language');

      expect(storedLang).toBe(null);
    });
  });

  describe('storeData', () => {
    it('should return language', () => {
      let language = new Language();
      language.id = 1;
      language.caption = "English";

      service.storeData('language', language);

      let storedLang = service.getData('language');

      expect(storedLang['id']).toBe(language.id);
    });

    it('should return null', () => {
      service.storeData('language', null);

      let storedLang = service.getData('language');

      expect(storedLang).toBe(null);
    });
  });

  describe('getDataFromOtherTabs', () => {
    it('should call two methods', () => {
      let setItemSpy = spyOn(localStorage, 'setItem');
      let removeItemSpy = spyOn(localStorage, 'removeItem');

      service.getDataFromOtherTabs();

      expect(setItemSpy).toHaveBeenCalledTimes(1);
      expect(removeItemSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('raiseUserSessionDataAvailable', () => {
    it('should call two methods', () => {
      let setItemSpy = spyOn(localStorage, 'setItem');
      let removeItemSpy = spyOn(localStorage, 'removeItem');

      service.raiseUserSessionDataAvailable();

      expect(setItemSpy).toHaveBeenCalledTimes(1);
      expect(removeItemSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('raiseUserLogout', () => {
    it('should call two methods', () => {
      let setItemSpy = spyOn(localStorage, 'setItem');
      let removeItemSpy = spyOn(localStorage, 'removeItem');

      service.raiseUserLogout();

      expect(setItemSpy).toHaveBeenCalledTimes(1);
      expect(removeItemSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('raiseUserLogin', () => {
    it('should call two methods', () => {
      let setItemSpy = spyOn(localStorage, 'setItem');
      let removeItemSpy = spyOn(localStorage, 'removeItem');

      service.raiseUserLogin();

      expect(setItemSpy).toHaveBeenCalledTimes(1);
      expect(removeItemSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('raiseUserTokenRefreshed', () => {
    it('should call two methods', () => {
      let setItemSpy = spyOn(localStorage, 'setItem');
      let removeItemSpy = spyOn(localStorage, 'removeItem');

      service.raiseUserTokenRefreshed();

      expect(setItemSpy).toHaveBeenCalledTimes(1);
      expect(removeItemSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('storageEventListener', () => {

    it('should call raiseUserSessionDataAvailable', () => {
      let spy = spyOn(service, 'raiseUserSessionDataAvailable');
      let event = {
        key: 'getUserInitialData',
        newValue: new Guid(mockLoggerservice).getGuid()
      } as StorageEvent;

      service.storageEventListener(event)

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should emit loadDataDone', () => {
      let spy = spyOn(mockEventsService.loadDataDone, 'emit');
      let event = {
        key: 'getUserInitialData',
        newValue: new Guid(mockLoggerservice).getGuid()
      } as StorageEvent;

      service.guid = event.newValue;
      service.storageEventListener(event)

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call loadDataDone after calling storeData', () => {
      let loadDataDoneSpy = spyOn(mockEventsService.loadDataDone, 'emit');
      let storeDataSpy = spyOn(service, 'storeData');

      let object = {
        user: JSON.stringify(new AuthenticatedUser().token = 'testToke')
      };

      let data = {
        source: new Guid(mockLoggerservice).getGuid(),
        sessionStorage: object
      };

      let event = {
        key: 'userInitialData',
        newValue: JSON.stringify(data)
      } as StorageEvent;

      service.storageEventListener(event);

      expect(storeDataSpy).toHaveBeenCalledTimes(1);
      expect(loadDataDoneSpy).toHaveBeenCalledTimes(1);
    });

    it('should call logoutUser after calling storeData', () => {
      let logoutUserSpy = spyOn(mockEventsService.logoutUser, 'emit');
      let storeDataSpy = spyOn(service, 'storeData');

      let object = {
        user: JSON.stringify(new AuthenticatedUser().token = 'testToke')
      };

      let data = {
        source: new Guid(mockLoggerservice).getGuid(),
        sessionStorage: object
      };

      let event = {
        key: 'userLogout',
        newValue: JSON.stringify(data)
      } as StorageEvent;

      service.storageEventListener(event);

      expect(storeDataSpy).toHaveBeenCalledTimes(1);
      expect(logoutUserSpy).toHaveBeenCalledTimes(1);
    });

    it('should call loginUser after calling storeData', () => {
      let loginUserSpy = spyOn(mockEventsService.loginUser, 'emit');
      let storeDataSpy = spyOn(service, 'storeData');

      let object = {
        user: JSON.stringify(new AuthenticatedUser().token = 'testToke')
      };

      let data = {
        source: new Guid(mockLoggerservice).getGuid(),
        sessionStorage: object
      };

      let event = {
        key: 'userLogin',
        newValue: JSON.stringify(data)
      } as StorageEvent;

      service.storageEventListener(event);

      expect(storeDataSpy).toHaveBeenCalledTimes(1);
      expect(loginUserSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('isDifferentSessionStorage', () => {
    it('should return true', () => {
      let newSession = { 'what': 'the matter' };
      sessionStorage.setItem('test', 'new');

      let result = service.isDifferentSessionStorage(newSession);

      expect(result).toBe(true);
    });

    it('should return false', () => {
      let result = service.isDifferentSessionStorage(null);

      expect(result).toBe(false);
    });
  });
});
