import { TestBed } from '@angular/core/testing';
import { CacheService } from './cache.service';
import { LoggerService } from './logger.service';
import { SessionStorageService } from './session-storage.service';
import { Language } from '../models/language';
import { AuthenticatedUser } from '../models/authenticated-User';

describe('CacheService', () => {
  let service: CacheService;
  let mockLoggerservice;

  beforeEach(() => {
    mockLoggerservice = jasmine.createSpyObj(['error', 'info']);

    TestBed.configureTestingModule({
      providers: [CacheService,
        { provide: LoggerService, useValue: mockLoggerservice },
        SessionStorageService,
      ],
    });
    service = TestBed.get(CacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setUser', () => {
    it('it should call storeData', () => {
      const storeDataSpy = spyOn(SessionStorageService.prototype, 'storeData');

      service.setUser(new AuthenticatedUser());

      expect(storeDataSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUser', () => {
    it('it should call storeData', () => {
      const getDataSpy = spyOn(SessionStorageService.prototype, 'getData');

      service.getUser();

      expect(getDataSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('setlanguages', () => {
    it('languages should be null', () => {
      service.setlanguages(null);

      expect(service.cache.languages).toBe(null);
    });

    it('languages should not be null', () => {
      service.setlanguages(new Array<Language>());

      expect(service.cache.languages).not.toBe(null);
    });
  });

  describe('getLanguages', () => {
    it('languages should be null', () => {
      service.setlanguages(null);

      const languages = service.getLanguages();

      expect(languages).toBe(null);
    });

    it('languages should not be null', () => {
      service.setlanguages(new Array<Language>());

      const languages = service.getLanguages();

      expect(languages).not.toBe(null);
    });
  });

  describe('setCurrentLanguage', () => {
    it('it should call storeData', () => {
      const storeDataSpy = spyOn(SessionStorageService.prototype, 'storeData');

      service.setCurrentLanguage(new Language());

      expect(storeDataSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCurrentLanguage', () => {
    it('it should call storeData', () => {
      const getDataSpy = spyOn(SessionStorageService.prototype, 'getData');

      service.getCurrentLanguage();

      expect(getDataSpy).toHaveBeenCalledTimes(1);
    });
  });
});
