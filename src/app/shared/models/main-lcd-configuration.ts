import { CountersOption, MainLCDDisplayMode } from './enum';

export class MainLCDConfiguration {
  public countersOption: CountersOption;
  public counters: any[];
  public displayMode: MainLCDDisplayMode;
  public allServicesSelected: boolean;
  public enablePaging: boolean;
  public idleTimeForPaging: number;
  public pageDuration: number;
  public services: any[];

  constructor(pDisplayMode: MainLCDDisplayMode, pAllServicesSelected: boolean, pEnablePaging: boolean, pIdleTimeForPaging: number, pPageDuration: number,
              pcountersOption: CountersOption) {
    this.displayMode = pDisplayMode;
    this.allServicesSelected = pAllServicesSelected;
    this.enablePaging = pEnablePaging;
    this.idleTimeForPaging = pIdleTimeForPaging;
    this.pageDuration = pPageDuration;
    this.countersOption = pcountersOption;
    this.counters = new Array<any>();
    this.services = new Array<any>();
  }
}
