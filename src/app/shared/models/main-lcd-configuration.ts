import { CountersOption, MainLCDDisplayMode } from "./enum";

export class MainLCDConfiguration {

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

  countersOption: CountersOption;
  counters: any[];
  displayMode: MainLCDDisplayMode;
  allServicesSelected: boolean;
  enablePaging: boolean;
  idleTimeForPaging: number;
  pageDuration: number;
  services: any[];
}
