import { Injectable } from '@angular/core';
import { Language } from '../models/language';
import { keyValue } from '../models/key-value';
import { LoggerService } from './logger.service';
import { CommunicationManagerService } from './communication-manager.service';
import { CacheService } from './cache.service';
import { EventsService } from './events.service';
import { Constants } from '../models/constants';

@Injectable()
export class MultilingualService {
  languages: Language[] = [];
  captions: keyValue[] = [];
  defaultLanguageId: number;
  filesPath = 'ComponentPortal/assets/resources/';
  filesExtension = '.json';

  constructor(private logger: LoggerService, private commManagerService: CommunicationManagerService,
    private cacheService: CacheService, private eventsService: EventsService) { }

  /**
  * @async
  * @summary - get the current language and initialize languages
  */
  async initialize(): Promise<void> {
    try {
      let language = this.cacheService.getCurrentLanguage();
      let languageID = language ? language.id : 1;
      await this.loadLanguage(languageID);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - get the organaization languages and set current language
   * @param {number} languageID - the language ID you want to set as current
   */
  async loadLanguage(languageID: number): Promise<void>  {
    try {
      if (!this.languages || this.languages.length <= 0) {
        this.languages = await this.commManagerService.loadLanguages();
        this.cacheService.setlanguages(this.languages);
      }
      let language = this.languages.find(p => p.id.toString() === languageID.toString());
      if (language) {
        this.cacheService.setCurrentLanguage(language);
        let filePath = this.getFileName(language.prefix);
        let captions = await this.commManagerService.loadFile(filePath);
        this.captions = <keyValue[]>captions;
        this.eventsService.languageChanged.emit(language);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - creates the caption file path of a language
   * @param {string} langPrefix - the prefix of current language
   * @returns {string} - the caption file path
   */
  getFileName(langPrefix: string): string {
    try {
      let filePath = `${this.filesPath}${langPrefix}${this.filesExtension}`;
      return filePath;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  /**
   * @summary - get the caption of a key
   * @param {string} key - the caption id
   * @returns {string} - the caption
   */
  getCaption(key: string): string {
    try {
      let caption = key + `_${Constants.cCAPTION}`;
      if (this.captions && this.captions.length > 0) {
        let captionObject = this.captions.find(p => p.key === key);
        if (captionObject) {
          caption = captionObject.value;
        }
      }
      return caption;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }
}
