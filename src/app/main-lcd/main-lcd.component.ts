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
import { UICVMComponent } from '../shared/models/ui-cvm-component';

@Component({
  selector: 'app-main-lcd',
  templateUrl: './main-lcd.component.html',
  styleUrls: ['./main-lcd.component.css'],
})
export class MainLCDComponent implements OnInit, OnDestroy {
  public displayedColumns = ['assigned', 'name_L1', 'number', 'direction'];
  public displayedSeriveColumns = ['assigned', 'nameL1'];
  public directionArray = ['remove', 'arrow_forward', 'arrow_back'];
  public dataSource: MatTableDataSource<Counter>;
  public dataSourceService: MatTableDataSource<Service>;
  public enablePaging: boolean;
  public mainLCDForm: FormGroup;
  public mainLCD: UICVMComponent;
  public mainLCDConfiguration: MainLCDConfiguration;
  public mainLCDID: number;
  public name: string;
  public queueInfoDisplay: string;
  public counterAllocation: string;
  public identifyCaption: string;
  public displayAllOption: string;
  public customizeCounters: string;
  public assigned: string;
  public number: string;
  public direction: string;
  public cDisplayMode: string;
  public currentCustomer: string;
  public withWaitingCaption: string;
  public enablePagingCaption: string;
  public timeToWait: string;
  public displayDuration: string;
  public allServices: string;
  public customizeServices: string;
  public save: string;
  public deviceConfiguration: string;
  public saveSuccess: string;
  public changesSaved: string;
  public cancel: string;
  public languageDirection: string;
  public languageIndex: string;
  public identity: string;
  public ipAddress: string;
  public typeCaption: string;
  public generalInfoCaption: string;
  public branchCaption: string;
  @ViewChildren(MatSort) public sorts: MatSort;
  @ViewChildren(MatPaginator) public paginator: MatPaginator;
  public displayMode = MainLCDDisplayMode.CurrentCustomer;
  public allServicesSelected = false;
  public counterOption = CountersOption.All;
  public isReady = false;
  public disabled = false;
  public canEdit = true;
  private subscription: Subscription;

  constructor(private route: ActivatedRoute, public mainLCDService: MainLCDService, private eventService: EventsService,
              private fb: FormBuilder, private logger: LoggerService, public dialog: MatDialog, private stateService: StateService,
              private languageService: MultilingualService, private cdRef: ChangeDetectorRef, private matPaginator: MatPaginatorIntl,
              private commonService: CommonActionsService, private router: Router, private cache: CacheService) {
      this.listenToEvents();
  }

  public ngOnInit() {
    try {
      this.isReady = this.stateService.getStatus() === InternalStatus.Ready;
      this.languageDirection = this.cache.getCurrentLanguage().rtl === 1 ? Constants.cRTL : Constants.cLTR;
      this.languageIndex = this.cache.getCurrentLanguage().index;
      this.fillFormGroup();
      this.route.params.subscribe(async (params) => {
        if (params && (params.pid || params.PID)) {
          this.mainLCDID = params.pid ? params.pid : params.PID;
          const tResult = await this.mainLCDService.getSettings(this.mainLCDID, this.languageIndex);
          if (tResult === Result.Success) {
            this.intilizeSettings();
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
  public intilizeSettings(): void {
    try {
      this.mainLCDConfiguration = this.mainLCDService.mainLCDConfiguration;
      this.mainLCD = this.mainLCDService.mainLCDUI;
      this.enablePaging = this.mainLCDConfiguration.enablePaging;
      this.dataSource = new MatTableDataSource(this.mainLCDConfiguration.counters);
      this.dataSourceService = new MatTableDataSource(this.mainLCDConfiguration.services);
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
  public async validateSettings(): Promise<void> {
    try {
      if (!this.mainLCDForm.invalid && !this.disabled) {
        let isValid = true;
        this.mainLCDConfiguration.countersOption = this.mainLCDForm.get(Constants.cCOUNTERS_VALUE).value;

        if (this.mainLCDConfiguration.countersOption === CountersOption.All) {
          this.mainLCDConfiguration.counters = [];
        } else {
          this.mainLCDConfiguration.counters = this.dataSource.data.filter((c) => c.assigned === true);
        }

        this.mainLCDConfiguration.displayMode = this.mainLCDForm.get(Constants.cPLAYER_MODE).value;

        if (this.mainLCDConfiguration.displayMode === MainLCDDisplayMode.WithWaiting) {
          this.mainLCDConfiguration.enablePaging = false;

          this.mainLCDConfiguration.allServicesSelected = this.mainLCDForm.get(Constants.cSERVICES_VALUE).value;

          if (this.mainLCDConfiguration.allServicesSelected) {
            this.mainLCDConfiguration.services = [];
          } else {
            this.mainLCDConfiguration.services = this.dataSourceService.data.filter((c) => c.assigned === true);
          }
        } else {
          this.mainLCDConfiguration.services = [];
          this.mainLCDConfiguration.enablePaging = this.enablePaging;

          if (this.mainLCDConfiguration.enablePaging) {
            const tPageDuration = this.mainLCDForm.get(Constants.cPAGE_DURATION).value;
            const tWaiteTime = this.mainLCDForm.get(Constants.cWAITE_TIME).value;

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
        await this.saveSettings(isValid);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async saveSettings(pIsValid: boolean): Promise<void> {
    try {
      const tTitle = this.languageService.getCaption(Constants.cSAVE_CONFIGURATION);
      let tSubTitle = this.languageService.getCaption(Constants.cWRONG_DATA);
      let tMessage = this.languageService.getCaption(Constants.cCHECK_INPUT);
      let tCancelText = this.languageService.getCaption(Constants.cCANCEL);
      const tYesText = this.languageService.getCaption(Constants.cOK);
      let tCallBack = null;
      if (pIsValid) {
        const result = await this.mainLCDService.setConfiguration(this.mainLCDID, this.mainLCDConfiguration);

        if (result === Result.Success) {
          tSubTitle = this.languageService.getCaption(Constants.cSAVE_SUCCESS);
          tMessage = this.languageService.getCaption(Constants.cSAVE_SUCCESS_MESSAGE);
          tCancelText = '';
          tCallBack = this.afterSaveDialogClose;
        } else {
          tSubTitle = this.languageService.getCaption(Constants.cSAVE_FAILED);
          tMessage = this.languageService.getCaption(Constants.cSAVE_FAILED_MESSAGE);
          tCancelText = '';
        }
      }
      this.openDialog(tTitle, tSubTitle, tMessage, tCancelText, tYesText, tCallBack);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary enable or disable page duaration and wait time inputs
   * @param display - show pagging or not
   */
  public togglePaging(pDisplay: boolean): void {
    try {
      if (!pDisplay) {
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
  public openDirectionsDialog(tCounterID: number): void {
    try {
      const tDialogRef = this.dialog.open(DirectionComponent, {
        data: { Direction: 0 },
      });

      tDialogRef.afterClosed().subscribe((result) => {
        if (result && (result.Direction != null && result.Direction !== undefined)) {
          this.dataSource.data.map((counter) => {
            if (counter.id === tCounterID) {
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
  public openDialog(pTitle: string, pSubTitle: string, pMessage: string, pCancelText: string, pYesText: string, pCallBack?: any): void {
    try {
      const tDialogRef = this.dialog.open(DialogComponent, {
        data: {
          title: pTitle,
          subTitle: pSubTitle,
          message: pMessage,
          cancelText: pCancelText,
          yesText: pYesText,
        },
      });

      tDialogRef.afterClosed().subscribe((result) => {
        if (pCallBack) {
          pCallBack(result, this);
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
  public fillFormGroup(): void {
    try {
      let tIdleTimeForPaging = 30;
      let tPageDuration = 10;

      if (this.mainLCDConfiguration) {
        tIdleTimeForPaging = this.mainLCDConfiguration.idleTimeForPaging;
        tPageDuration = this.mainLCDConfiguration.pageDuration;
        this.counterOption = this.mainLCDConfiguration.countersOption;
        this.displayMode = this.mainLCDConfiguration.displayMode;
        this.allServicesSelected = this.mainLCDConfiguration.allServicesSelected;
      }

      this.mainLCDForm = this.fb.group({
        waiteTime: [tIdleTimeForPaging, NumberValidators.range(5, 300)],
        pageDuration: [tPageDuration, NumberValidators.range(5, 300)],
        countersValue: [this.counterOption],
        playerMode: [this.displayMode],
        servicesValue: [this.allServicesSelected],
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - send commands to a specific component
   */
  public async identify(): Promise<void> {
    try {
      const tResult = await this.mainLCDService.identify(this.mainLCDID);
      if (tResult === Result.Success) {
       const tSubTitle = this.languageService.getCaption(Constants.cSAVE_SUCCESS);
       const tYesText = this.languageService.getCaption(Constants.cOK);
       const tMessage = this.languageService.getCaption(Constants.cIDENTIFICATION_SUCCESS);
       const tTitle = this.languageService.getCaption(Constants.cIDENTIFY_QUEUE_INFO_DISPLAYS);

       this.openDialog(tTitle , tSubTitle, tMessage, null, tYesText);
      } else {
        this.showError(tResult);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  public afterSaveDialogClose(pResult: boolean, pRefrence: any) {
    const that = pRefrence;
    try {
      that.router.navigate([`/${Constants.cDEVICES}`]);
    } catch (error) {
      that.logger.error(error);
    }
  }

  /**
   * @summary - subscribes to Form events
   */
  public listenToFormValueChanges(): void {
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
  public loadCaptions(): void {
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
  public async showError(pErrorCode: number, pAdditionalMessage?: string): Promise<void> {
    try {
      let tError = this.commonService.getErrorCaption(pErrorCode);
      const tAdditionalMessageCaption = pAdditionalMessage ? ' ' + this.languageService.getCaption(pAdditionalMessage) : '';
      tError += tAdditionalMessageCaption;

      await this.openDialog(Constants.cERROR, '', tError, '', Constants.cOK);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - get if user has edit permition
   */
  public async getPermition(): Promise<void> {
    try {
      this.canEdit = await this.commonService.checkPermission(PermissionType.Edit);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - subscribes to events
   */
  public listenToEvents(): void {
    try {
      this.subscription = this.eventService.statusUpdate.subscribe((state) => {
        this.isReady = state === InternalStatus.Ready;
        if (this.isReady) {
          this.loadCaptions();
          this.cdRef.detectChanges();
        }
      });

      const tLanguageChangedSub = this.eventService.languageChanged.subscribe(() => { this.loadCaptions(); this.cdRef.detectChanges(); });
      this.subscription.add(tLanguageChangedSub);

      const tUnAuthorizedActionSub = this.eventService.unAuthorizedAction.subscribe((entityName) => {
        if (entityName) {
          if (entityName === Constants.cCOUNTER || entityName === Constants.cSERVICE) {
            this.showError(Error.NotAllowed, entityName);
            this.disabled = true;
            this.mainLCDConfiguration = new MainLCDConfiguration(MainLCDDisplayMode.CurrentCustomer, false,
              false, this.mainLCDService.idleTimeForPaging, this.mainLCDService.pageDuration, CountersOption.All);
          }
        }
      });
      this.subscription.add(tUnAuthorizedActionSub);

      const tRebootSub = this.eventService.reboot.subscribe(() => {
        this.ngOnInit();
      });
      this.subscription.add(tRebootSub);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - unsubscribe to the events
   */
  public ngOnDestroy(): void {
    try {
      this.subscription.unsubscribe();
    } catch (error) {
      this.logger.error(error);
    }
  }
}
