import { TestBed, inject } from '@angular/core/testing';
import { MultilingualService } from './multilingual.service';
import { LoggerService } from './logger.service';
import { CacheService } from './cache.service';
import { Language } from '../models/language';
import { CommunicationManagerService } from './communication-manager.service';
import { EventEmitter } from '@angular/core';
import { EventsService } from './events.service';
import { Constants } from '../models/constants';

describe('MultilingualService', () => {
  let service: MultilingualService;
  let mockLoggerservice, mockCommunicationManagerService, mockEventsService;

  mockEventsService = {
    languageChanged: new EventEmitter(),
  };

  mockEventsService.languageChanged = new EventEmitter();

  mockCommunicationManagerService = {
    loadLanguages() {
      let language = new Language();
      language.id = 1;
      language.caption = 'English';
      language.index = 0;
      language.prefix = 'en-US';
      language.rtl = 0;

      let languages = new Array<Language>();
      languages.push(language);

      return languages;
    },
    loadFile(path) {
      return [
        {"key":"All","value":"All"},
        {"key":"Save","value":"Save"},
        {"key":"WithWaiting","value":"Current customer with waiting"}]
    }
  };

  beforeEach(() => {
    mockLoggerservice = jasmine.createSpyObj(['error', 'info']);

    TestBed.configureTestingModule({
      providers: [
        MultilingualService,
        CacheService,
        { provide: LoggerService, useValue: mockLoggerservice },
        { provide: CommunicationManagerService, useValue: mockCommunicationManagerService},
        { provide: EventsService, useValue: mockEventsService},
      ]
    });

    service = TestBed.get(MultilingualService);
  });

  it('should be created',() => {
    expect(service).toBeTruthy();
  });

  describe('initialize', () => {
    it('should call two methods', async () => {
      let cacheServiceSpy = spyOn(CacheService.prototype, 'getCurrentLanguage');
      let loadLanguagesSpy = spyOn(service, 'loadLanguage');

      await service.initialize();

      expect(cacheServiceSpy).toHaveBeenCalledTimes(1);
      expect(loadLanguagesSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadLanguage', () => {

    it('it should call four methods', async () => {
      let setlanguagesSpy = spyOn(CacheService.prototype, 'setlanguages');
      let setCurrentLanguageSpy = spyOn(CacheService.prototype, 'setCurrentLanguage');
      let getFileNameSpy = spyOn(service, 'getFileName');
      let emitSpy = spyOn(mockEventsService.languageChanged, 'emit');

      await service.loadLanguage(1);

      expect(setlanguagesSpy).toHaveBeenCalledTimes(1);
      expect(setCurrentLanguageSpy).toHaveBeenCalledTimes(1);
      expect(getFileNameSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('it should call one method', async () => {
      let setlanguagesSpy = spyOn(CacheService.prototype, 'setlanguages');
      let setCurrentLanguageSpy = spyOn(CacheService.prototype, 'setCurrentLanguage');
      let getFileNameSpy = spyOn(service, 'getFileName');
      let emitSpy = spyOn(mockEventsService.languageChanged, 'emit');

      await service.loadLanguage(5);

      expect(setlanguagesSpy).toHaveBeenCalledTimes(1);
      expect(setCurrentLanguageSpy).toHaveBeenCalledTimes(0);
      expect(getFileNameSpy).toHaveBeenCalledTimes(0);
      expect(emitSpy).toHaveBeenCalledTimes(0);
    });

  });

  describe('getFileName', () => {
    it('should return path', () => {
      let path = 'ComponentPortal/assets/resources/en-US.json'

      let result = service.getFileName('en-US');

      expect(result).toBe(path);
    });
  });

  describe('getCaption', () => {
    it('should return defualt caption', () => {
      let caption = `test_${Constants.cCAPTION}`

      let result = service.getCaption('test');

      expect(result).toBe(caption);
    });

    it('should return caption', () => {
      service.captions = [
        {"key":"All","value":"All"},
        {"key":"Save","value":"Save"},
        {"key":"WithWaiting","value":"Current customer with waiting"}];

        let result = service.getCaption('WithWaiting');

        expect(result).toBe('Current customer with waiting');
    });
  });
});
