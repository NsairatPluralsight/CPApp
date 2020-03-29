import { TestBed } from '@angular/core/testing';
import { SessionStorageService } from './session-storage.service';
import { EventEmitter } from '@angular/core';
import { EventsService } from './events.service';
import { LoggerService } from './logger.service';
import { Language } from '../models/language';
import { Guid } from '../models/guid';
import { AuthenticatedUser } from '../models/authenticated-User';

describe('SessionStorageService', () => {
  let service: SessionStorageService;
  let mockLoggerservice;
  let mockEventsService;

  mockEventsService = {
    loadDataDone: new EventEmitter(),
    logoutUser: new EventEmitter(),
    loginUser: new EventEmitter(),
  };

  mockEventsService.loadDataDone = new EventEmitter();
  mockEventsService.logoutUser = new EventEmitter();
  mockEventsService.loginUser = new EventEmitter();

  beforeEach(() => {
    mockLoggerservice = jasmine.createSpyObj(['error', 'info']);

    TestBed.configureTestingModule({
      providers: [SessionStorageService,
        { provide: EventsService, useValue: mockEventsService },
        { provide: LoggerService, useValue: mockLoggerservice },
      ],
    });
    service = TestBed.get(SessionStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('storeData', () => {
    it('should store language', () => {
      const language = new Language();
      language.id = 1;
      language.caption = 'English';
      service.storeData('language', language);

      const storedLang = JSON.parse(sessionStorage.getItem('language'));

      expect(storedLang['id']).toBe(language.id);
    });

    it('should remove language', () => {
      const language = new Language();
      language.id = 1;
      language.caption = 'English';
      service.storeData('language', language);
      service.storeData('language', null);

      const storedLang = sessionStorage.getItem('language');

      expect(storedLang).toBe(null);
    });
  });

  describe('storeData', () => {
    it('should return language', () => {
      const language = new Language();
      language.id = 1;
      language.caption = 'English';
      service.storeData('language', language);

      const storedLang = service.getData('language');

      expect(storedLang['id']).toBe(language.id);
    });

    it('should return null', () => {
      service.storeData('language', null);

      const storedLang = service.getData('language');

      expect(storedLang).toBe(null);
    });
  });

  describe('getDataFromOtherTabs', () => {
    it('should call two methods', () => {
      const setItemSpy = spyOn(localStorage, 'setItem');
      const removeItemSpy = spyOn(localStorage, 'removeItem');

      service.getDataFromOtherTabs();

      expect(setItemSpy).toHaveBeenCalledTimes(1);
      expect(removeItemSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('raiseUserSessionDataAvailable', () => {
    it('should call two methods', () => {
      const setItemSpy = spyOn(localStorage, 'setItem');
      const removeItemSpy = spyOn(localStorage, 'removeItem');

      service.raiseUserSessionDataAvailable();

      expect(setItemSpy).toHaveBeenCalledTimes(1);
      expect(removeItemSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('raiseUserLogout', () => {
    it('should call two methods', () => {
      const setItemSpy = spyOn(localStorage, 'setItem');
      const removeItemSpy = spyOn(localStorage, 'removeItem');

      service.raiseUserLogout();

      expect(setItemSpy).toHaveBeenCalledTimes(1);
      expect(removeItemSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('raiseUserLogin', () => {
    it('should call two methods', () => {
      const setItemSpy = spyOn(localStorage, 'setItem');
      const removeItemSpy = spyOn(localStorage, 'removeItem');

      service.raiseUserLogin();

      expect(setItemSpy).toHaveBeenCalledTimes(1);
      expect(removeItemSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('raiseUserTokenRefreshed', () => {
    it('should call two methods', () => {
      const setItemSpy = spyOn(localStorage, 'setItem');
      const removeItemSpy = spyOn(localStorage, 'removeItem');

      service.raiseUserTokenRefreshed();

      expect(setItemSpy).toHaveBeenCalledTimes(1);
      expect(removeItemSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('storageEventListener', () => {
    it('should call raiseUserSessionDataAvailable', () => {
      const spy = spyOn(service, 'raiseUserSessionDataAvailable');
      const event = {
        key: 'getUserInitialData',
        newValue: new Guid(mockLoggerservice).getGuid(),
      } as StorageEvent;

      service.storageEventListener(event);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should emit loadDataDone', () => {
      const spy = spyOn(mockEventsService.loadDataDone, 'emit');
      const event = {
        key: 'getUserInitialData',
        newValue: new Guid(mockLoggerservice).getGuid(),
      } as StorageEvent;
      service.guid = event.newValue;

      service.storageEventListener(event);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call loadDataDone after calling storeData', () => {
      const loadDataDoneSpy = spyOn(mockEventsService.loadDataDone, 'emit');
      const storeDataSpy = spyOn(service, 'storeData');
      const object = {
        user: JSON.stringify(new AuthenticatedUser().token = 'testToke'),
      };
      const data = {
        source: new Guid(mockLoggerservice).getGuid(),
        sessionStorage: object,
      };
      const event = {
        key: 'userInitialData',
        newValue: JSON.stringify(data),
      } as StorageEvent;

      service.storageEventListener(event);

      expect(storeDataSpy).toHaveBeenCalledTimes(1);
      expect(loadDataDoneSpy).toHaveBeenCalledTimes(1);
    });

    it('should call logoutUser after calling storeData', () => {
      const logoutUserSpy = spyOn(mockEventsService.logoutUser, 'emit');
      const storeDataSpy = spyOn(service, 'storeData');
      const object = {
        user: JSON.stringify(new AuthenticatedUser().token = 'testToke'),
      };
      const data = {
        source: new Guid(mockLoggerservice).getGuid(),
        sessionStorage: object,
      };
      const event = {
        key: 'userLogout',
        newValue: JSON.stringify(data),
      } as StorageEvent;

      service.storageEventListener(event);

      expect(storeDataSpy).toHaveBeenCalledTimes(1);
      expect(logoutUserSpy).toHaveBeenCalledTimes(1);
    });

    it('should call loginUser after calling storeData', () => {
      const loginUserSpy = spyOn(mockEventsService.loginUser, 'emit');
      const storeDataSpy = spyOn(service, 'storeData');
      const object = {
        user: JSON.stringify(new AuthenticatedUser().token = 'testToke'),
      };
      const data = {
        source: new Guid(mockLoggerservice).getGuid(),
        sessionStorage: object,
      };
      const event = {
        key: 'userLogin',
        newValue: JSON.stringify(data),
      } as StorageEvent;

      service.storageEventListener(event);

      expect(storeDataSpy).toHaveBeenCalledTimes(1);
      expect(loginUserSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('isDifferentSessionStorage', () => {
    it('should return true', () => {
      const newSession = { what: 'the matter' };
      sessionStorage.setItem('test', 'new');
      const result = service.isDifferentSessionStorage(newSession);

      expect(result).toBe(true);
    });

    it('should return false', () => {
      const result = service.isDifferentSessionStorage(null);

      expect(result).toBe(false);
    });
  });
});
