import { Injectable } from '@angular/core';
import { Language } from '../models/language';
import { KeyValue } from '../models/key-value';
import { LoggerService } from './logger.service';
import { CommunicationManagerService } from './communication-manager.service';
import { CacheService } from './cache.service';
import { EventsService } from './events.service';
import { Constants } from '../models/constants';

@Injectable()
export class MultilingualService {
  public languages: Language[] = [];
  public captions: KeyValue[] = [];
  public defaultLanguageId: number;
  public filesPath = 'ComponentPortal/assets/resources/';
  public filesExtension = '.json';

  constructor(private logger: LoggerService, private commManagerService: CommunicationManagerService,
              private cacheService: CacheService, private eventsService: EventsService) { }

  /**
   * @async
   * @summary - get the current language and initialize languages
   */
  public async initialize(): Promise<void> {
    try {
      const tLanguage = this.cacheService.getCurrentLanguage();
      const tLanguageID = tLanguage ? tLanguage.id : 1;
      await this.loadLanguage(tLanguageID);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - get the organaization languages and set current language
   * @param {number} languageID - the language ID you want to set as current
   */
  public async loadLanguage(pLanguageID: number): Promise<void>  {
    try {
      if (!this.languages || this.languages.length <= 0) {
        this.languages = await this.commManagerService.loadLanguages();
        this.cacheService.setlanguages(this.languages);
      }
      const tLanguage = this.languages.find((p) => p.id.toString() === pLanguageID.toString());
      if (tLanguage) {
        this.cacheService.setCurrentLanguage(tLanguage);
        const tFilePath = this.getFileName(tLanguage.prefix);
        const tCaptions = await this.commManagerService.loadFile(tFilePath);
        this.captions =  tCaptions as KeyValue[];
        this.eventsService.languageChanged.emit(tLanguage);
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
  public getFileName(pLangPrefix: string): string {
    try {
      const tFilePath = `${this.filesPath}${pLangPrefix}${this.filesExtension}`;
      return tFilePath;
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
  public getCaption(pKey: string): string {
    try {
      let tCaption = pKey + `_${Constants.cCAPTION}`;
      if (this.captions && this.captions.length > 0) {
        const captionObject = this.captions.find((p) => p.key === pKey);
        if (captionObject) {
          tCaption = captionObject.value;
        }
      }
      return tCaption;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }
}
