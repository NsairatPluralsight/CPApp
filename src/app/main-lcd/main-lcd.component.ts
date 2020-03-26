import { Component, OnInit, ViewChildren, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLCDService } from './services/main-lcd.service';
import { Result, CountersOption, MainLCDDisplayMode, Error, PermissionType, InternalStatus } from '../shared/models/enum';
import { MatTableDataSource, MatSort, MatDialog, MatPaginator, MatPaginatorIntl } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import { LoggerService } from '../shared/services/logger.service';
import { Counter } from '../shared/models/counter';
import { DirectionComponent } from './direction.component';
import { MainLCDConfiguration } from '../shared/models/main-lcd-configuration';
import { Service } from '../shared/models/service';
import { DialogComponent } from '../shared/components/dialog.component';
import { NumberValidators } from '../shared/models/number.validator';
import { EventsService } from '../shared/services/events.service';
import { StateService } from '../shared/services/state.service';
import { MultilingualService } from '../shared/services/multilingual.service';
import { Subscription } from 'rxjs';
import { Constants } from '../shared/models/constants';
import { CommonActionsService } from '../shared/services/common-actions.service';
import { CacheService } from '../shared/services/cache.service';
import { CVMComponent } from '../shared/models/cvm-component';

@Component({
  selector: 'app-main-lcd',
  templateUrl: './main-lcd.component.html',
  styleUrls: ['./main-lcd.component.css']
})
export class MainLCDComponent implements OnInit, OnDestroy {
  displayedColumns = ['assigned', 'name_L1', 'number', 'direction'];
  displayedSeriveColumns = ['assigned', 'nameL1'];
  directionArray = ['remove', 'arrow_forward', 'arrow_back'];
  dataSource: MatTableDataSource<Counter>;
  dataSourceService: MatTableDataSource<Service>;
  enablePaging: boolean;
  mainLCDForm: FormGroup;
  mainLCD: CVMComponent;
  mainLCDConfiguration: MainLCDConfiguration;
  mainLCDID: number;
  name: string;
  queueInfoDisplay: string;
  counterAllocation: string;
  identifyCaption: string;
  displayAllOption: string;
  customizeCounters: string;
  assigned: string;
  number: string;
  direction: string;
  cDisplayMode: string;
  currentCustomer: string;
  withWaitingCaption: string;
  enablePagingCaption: string;
  timeToWait: string;
  displayDuration: string;
  allServices: string;
  customizeServices: string;
  save: string;
  deviceConfiguration: string;
  saveSuccess: string;
  changesSaved: string;
  cancel: string;
  languageDirection: string;
  languageIndex: string;
  identity: string;
  ipAddress: string;
  typeCaption: string;
  branchName: string;
  generalInfoCaption: string;
  branchCaption: string;
  @ViewChildren(MatSort) sorts: MatSort;
  @ViewChildren(MatPaginator) paginator: MatPaginator;
  private subscription: Subscription;
  displayMode = MainLCDDisplayMode.CurrentCustomer;
  allServicesSelected = false;
  counterOption = CountersOption.All;
  isReady = false;
  disabled = false;
  canEdit = true;

  constructor(private route: ActivatedRoute, public mainLCDService: MainLCDService, private eventService: EventsService,
    private fb: FormBuilder, private logger: LoggerService, public dialog: MatDialog, private stateService: StateService,
    private languageService: MultilingualService, private cdRef: ChangeDetectorRef, private matPaginator: MatPaginatorIntl,
    private commonService: CommonActionsService, private router: Router, private cache: CacheService) {
      this.listenToEvents();
  }

  ngOnInit() {
    try {
      this.isReady = this.stateService.getStatus() === InternalStatus.Ready;
      this.languageDirection = this.cache.getCurrentLanguage().rtl === 1 ? Constants.cRTL : Constants.cLTR;
      this.languageIndex = this.cache.getCurrentLanguage().index;
      this.fillFormGroup();
      this.route.params.subscribe(async params => {
        if (params && (params.pid || params.PID)) {
          this.mainLCDID = params.pid ? params.pid : params.PID;
          let result = await this.mainLCDService.getSettings(this.mainLCDID);
          if (result == Result.Success) {
            this.intilizeSettings();
          } else {
          }
        }
      });
      this.loadCaptions();
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - fills the form
   */
  intilizeSettings(): void {
    try {
      this.mainLCDConfiguration = this.mainLCDService.mainLCDConfiguration;
      this.mainLCD = this.mainLCDService.mainLCD;
      this.enablePaging = this.mainLCDConfiguration.enablePaging;
      this.dataSource = new MatTableDataSource(this.mainLCDConfiguration.counters);
      this.dataSourceService = new MatTableDataSource(this.mainLCDConfiguration.services);
      this.branchName = this.mainLCDService.branch.name;
      this.fillFormGroup();
      this.listenToFormValueChanges();

      this.togglePaging(!this.enablePaging);
      this.dataSource.sort = this.sorts['_results'][0];
      this.dataSourceService.sort = this.sorts['_results'][1];
      this.dataSource.paginator = this.paginator['_results'][0];
      this.dataSourceService.paginator = this.paginator['_results'][1];
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
 * @async
 * @summary - gets the form values and save it if valid
 */
  async saveSettings(): Promise<void> {
    try {
      if (!this.mainLCDForm.invalid && !this.disabled) {
        let isValid = true;

        this.mainLCDConfiguration.countersOption = this.mainLCDForm.get(Constants.cCOUNTERS_VALUE).value;

        if (this.mainLCDConfiguration.countersOption == CountersOption.All) {
          this.mainLCDConfiguration.counters = [];
        } else {
          this.mainLCDConfiguration.counters = this.dataSource.data.filter(c => c.assigned === true);
        }

        this.mainLCDConfiguration.displayMode = this.mainLCDForm.get(Constants.cPLAYER_MODE).value;

        if (this.mainLCDConfiguration.displayMode == MainLCDDisplayMode.WithWaiting) {
          this.mainLCDConfiguration.enablePaging = false;

          this.mainLCDConfiguration.allServicesSelected = this.mainLCDForm.get(Constants.cSERVICES_VALUE).value;

          if (this.mainLCDConfiguration.allServicesSelected) {
            this.mainLCDConfiguration.services = [];
          } else {
            this.mainLCDConfiguration.services = this.dataSourceService.data.filter(c => c.assigned === true);
          }

        } else {
          this.mainLCDConfiguration.services = [];
          this.mainLCDConfiguration.enablePaging = this.enablePaging;

          if (this.mainLCDConfiguration.enablePaging) {
            let tPageDuration = this.mainLCDForm.get(Constants.cPAGE_DURATION).value;
            let tWaiteTime = this.mainLCDForm.get(Constants.cWAITE_TIME).value;

            if (tPageDuration > 4 && tPageDuration < 301) {
              this.mainLCDConfiguration.pageDuration = tPageDuration;
            } else {
              isValid = false;
            }

            if (tWaiteTime > 4 && tWaiteTime < 301) {
              this.mainLCDConfiguration.idleTimeForPaging = tWaiteTime;
            } else {
              isValid = false;
            }
          }
        }
        let title = this.languageService.getCaption(Constants.cSAVE_CONFIGURATION);
        let subTitle = this.languageService.getCaption(Constants.cWRONG_DATA);
        let message = this.languageService.getCaption(Constants.cCHECK_INPUT);
        let cancelText = this.languageService.getCaption(Constants.cCANCEL);
        let yesText = this.languageService.getCaption(Constants.cOK);
        let callBack = null;
        if (isValid) {
          let result = await this.mainLCDService.setConfiguration(this.mainLCDID, this.mainLCDConfiguration);

          if (result == Result.Success) {
            subTitle = this.languageService.getCaption(Constants.cSAVE_SUCCESS);
            message = this.languageService.getCaption(Constants.cSAVE_SUCCESS_MESSAGE);
            cancelText = '';
            callBack = this.afterSaveDialogClose;
          } else {
            subTitle = this.languageService.getCaption(Constants.cSAVE_FAILED);
            message = this.languageService.getCaption(Constants.cSAVE_FAILED_MESSAGE);
            cancelText = '';
          }
        }

        this.openDialog(title, subTitle, message, cancelText, yesText, callBack);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary enable or disable page duaration and wait time inputs
   * @param display - show pagging or not
   */
  togglePaging(display: boolean): void {
    try {
      if (!display) {
        this.mainLCDForm.get(Constants.cPAGE_DURATION).enable();
        this.mainLCDForm.get(Constants.cWAITE_TIME).enable();
      } else {
        this.mainLCDForm.get(Constants.cPAGE_DURATION).disable();
        this.mainLCDForm.get(Constants.cWAITE_TIME).disable();
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
 * @async
 * @summary - shows a pop up dialog with directions
 * @param {number} counterID - the id of a counter you want to set the direction for
 */
  openDirectionsDialog(counterID: number): void {
    try {
      let dialogRef = this.dialog.open(DirectionComponent, {
        data: { Direction: 0 },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result && (result.Direction != null && result.Direction != undefined)) {
          this.dataSource.data.map((counter) => {
            if (counter.id == counterID) {
              counter.direction = result.Direction;
            }
          });
        }
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - shows a pop up dialog with sent values
   * @param {string} title - the dialog title
   * @param {string} subTitle - the dialog sub title
   * @param {string} message - the dialog message
   * @param {string} cancelText - the cancel button text
   * @param {string} yesText - the yes button text
   * @param {any} callBack - optional function to call after confirmation
   */
  openDialog(title: string, subTitle: string, message: string, cancelText: string, yesText: string, callBack?: any): void {
    try {
      let dialogRef = this.dialog.open(DialogComponent, {
        data: {
          title: title,
          subTitle: subTitle,
          message: message,
          cancelText: cancelText,
          yesText: yesText
        }
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (callBack) {
          callBack(result, this);
        }
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - Initialize the main LCD Form
   */
  fillFormGroup(): void {
    try {
      let idleTimeForPaging = 30;
      let pageDuration = 10;

      if (this.mainLCDConfiguration) {
        idleTimeForPaging = this.mainLCDConfiguration.idleTimeForPaging;
        pageDuration = this.mainLCDConfiguration.pageDuration;
        this.counterOption = this.mainLCDConfiguration.countersOption;
        this.displayMode = this.mainLCDConfiguration.displayMode;
        this.allServicesSelected = this.mainLCDConfiguration.allServicesSelected;
      }

      this.mainLCDForm = this.fb.group({
        waiteTime: [idleTimeForPaging, NumberValidators.range(5, 300)],
        pageDuration: [pageDuration, NumberValidators.range(5, 300)],
        countersValue: [this.counterOption],
        playerMode: [this.displayMode],
        servicesValue: [this.allServicesSelected]
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - send commands to a specific component
   */
  async identify(): Promise<void> {
    try {
      let result = await this.mainLCDService.identify(this.mainLCDID);
      if (result === Result.Success) {
       let subTitle = this.languageService.getCaption(Constants.cSAVE_SUCCESS);
       let yesText = this.languageService.getCaption(Constants.cOK);
       let message = this.languageService.getCaption(Constants.cIDENTIFICATION_SUCCESS);
       let title = this.languageService.getCaption(Constants.cIDENTIFY_QUEUE_INFO_DISPLAYS);

       this.openDialog(title , subTitle, message, null, yesText);
      } else {
        this.showError(result);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  afterSaveDialogClose(result: boolean, refrence: any) {
    let that = refrence;
    try {
      that.router.navigate([`/${Constants.cDEVICES}`]);
    } catch (error) {
      that.logger.error(error);
    }
  }

  /**
  * @summary - subscribes to Form events
  */
  listenToFormValueChanges(): void {
    try {
      this.mainLCDForm.get(Constants.cCOUNTERS_VALUE).valueChanges.subscribe((value) => {
        this.counterOption = value;
      });
      this.mainLCDForm.get(Constants.cPLAYER_MODE).valueChanges.subscribe((value) => {
        this.displayMode = value;
      });
      this.mainLCDForm.get(Constants.cSERVICES_VALUE).valueChanges.subscribe((value) => {
        this.allServicesSelected = value;
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - load the captions of the component
   */
  loadCaptions(): void {
    try {
      this.name = this.languageService.getCaption(Constants.cNAME);
      this.queueInfoDisplay = this.languageService.getCaption(Constants.cQUEUE_INFO_DISPLAY);
      this.counterAllocation = this.languageService.getCaption(Constants.cCOUNTER_ALLOCATION);
      this.identifyCaption = this.languageService.getCaption(Constants.cIDENTIFY);
      this.displayAllOption = this.languageService.getCaption(Constants.cDISPLAY_ALL_OPTION);
      this.customizeCounters = this.languageService.getCaption(Constants.cCUSTOMIZE_COUNTERS);
      this.assigned = this.languageService.getCaption(Constants.cASSIGNED);
      this.number = this.languageService.getCaption(Constants.cNUMBER);
      this.direction = this.languageService.getCaption(Constants.cDIRECTION);
      this.cDisplayMode = this.languageService.getCaption(Constants.cDISPLAY_MODE);
      this.currentCustomer = this.languageService.getCaption(Constants.cCURRENT_CUSTOMER);
      this.withWaitingCaption = this.languageService.getCaption(Constants.cWITH_WAITING);
      this.enablePagingCaption = this.languageService.getCaption(Constants.cENABLE_PAGING);
      this.timeToWait = this.languageService.getCaption(Constants.cTIME_TO_WAIT);
      this.displayDuration = this.languageService.getCaption(Constants.cDISPLAY_DURATION);
      this.allServices = this.languageService.getCaption(Constants.cALL_SERVICES);
      this.customizeServices = this.languageService.getCaption(Constants.cCUSTOMIZE_SERVICES);
      this.save = this.languageService.getCaption(Constants.cSAVE);
      this.deviceConfiguration = this.languageService.getCaption(Constants.cSAVE_cDEVICE_CONFIGURATION);
      this.saveSuccess = this.languageService.getCaption(Constants.cSAVE_SUCCESS);
      this.changesSaved = this.languageService.getCaption(Constants.cSAVE_SUCCESS_MESSAGE);
      this.matPaginator.itemsPerPageLabel = this.languageService.getCaption(Constants.cITEMS_PER_PAGE);
      this.matPaginator.firstPageLabel = this.languageService.getCaption(Constants.cFIRST_PAGE);
      this.matPaginator.lastPageLabel = this.languageService.getCaption(Constants.cLAST_PAGE);
      this.matPaginator.nextPageLabel = this.languageService.getCaption(Constants.cNEXT_PAGE);
      this.matPaginator.previousPageLabel = this.languageService.getCaption(Constants.cPREVIOUS_PAGE);
      this.cancel = this.languageService.getCaption(Constants.cCANCEL);
      this.identity = this.languageService.getCaption(Constants.cIDENTITY);
      this.ipAddress = this.languageService.getCaption(Constants.cADDRESS);
      this.typeCaption = this.languageService.getCaption(Constants.cTYPE);
      this.generalInfoCaption = this.languageService.getCaption(Constants.cGENERAL_INFO);
      this.branchCaption = this.languageService.getCaption(Constants.cBRANCH);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - opens an error dialog
   * @param {number} errorCode - the code of error to get the caption
   */
  async showError(errorCode: number, additionalMessage?: string): Promise<void> {
    try {
      let error = this.commonService.getErrorCaption(errorCode);
      let additionalMessageCaption = additionalMessage ? ' ' + this.languageService.getCaption(additionalMessage) : '';
      error += additionalMessageCaption;

      await this.openDialog(Constants.cERROR, '', error, '', Constants.cOK);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - get if user has edit permition
   */
  async getPermition(): Promise<void> {
    try {
      this.canEdit = await this.commonService.checkPermission(PermissionType.Edit);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
    * @summary - subscribes to events
    */
  listenToEvents(): void {
    try {

      this.subscription = this.eventService.statusUpdate.subscribe((state) => {
        this.isReady = state === InternalStatus.Ready;
        if (this.isReady) {
          this.loadCaptions();
          this.cdRef.detectChanges();
        }
      });

      const languageChangedSub = this.eventService.languageChanged.subscribe(() => { this.loadCaptions(); this.cdRef.detectChanges(); });
      this.subscription.add(languageChangedSub);

      const unAuthorizedActionSub = this.eventService.unAuthorizedAction.subscribe((entityName) => {
        if (entityName) {
          if (entityName === Constants.cCOUNTER || entityName === Constants.cSERVICE) {
            this.showError(Error.NotAllowed, entityName);
            this.disabled = true;
            this.mainLCDConfiguration = new MainLCDConfiguration(MainLCDDisplayMode.CurrentCustomer, false,
              false, this.mainLCDService.idleTimeForPaging, this.mainLCDService.pageDuration, CountersOption.All);
          }
        }
      });
      this.subscription.add(unAuthorizedActionSub);

      const rebootSub = this.eventService.reboot.subscribe(() => {
        this.ngOnInit();
      });
      this.subscription.add(rebootSub);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - unsubscribe to the events
   */
  ngOnDestroy(): void {
    try {
      this.subscription.unsubscribe();
    } catch (error) {
      this.logger.error(error);
    }
  }
}
