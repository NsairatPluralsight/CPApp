import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Counter } from '../shared/models/counter';
import { LoggerService } from '../shared/services/logger.service';
import { CounterLCDService } from './counter-lcd.service';
import { EventsService } from '../shared/services/events.service';
import { Result, Error, PermissionType, InternalStatus } from '../shared/models/enum';
import { StateService } from '../shared/services/state.service';
import { ActivatedRoute } from '@angular/router';
import { CounterLCDConfiguration } from '../shared/models/counter-lcd-configuration';
import { MultilingualService } from '../shared/services/multilingual.service';
import { MatDialog } from '@angular/material';
import { DialogComponent } from '../shared/components/dialog.component';
import { Subscription } from 'rxjs';
import { Constants } from '../shared/models/constants';
import { CommonActionsService } from '../shared/services/common-actions.service';

@Component({
  selector: 'app-counter-lcd',
  templateUrl: './counter-lcd.component.html',
  styleUrls: ['./counter-lcd.component.css'],
})
export class CounterLCDComponent implements OnInit, OnDestroy {
  public countersForm: FormGroup;
  public counters: Counter[];
  public counterLCDConfiguration: CounterLCDConfiguration;
  public counter_LCD_ID: number;
  public save: string;
  public identifyCaption: string;
  public title: string;
  public forCounter: string;
  public disabled = false;
  public isReady = false;
  public canEdit = true;
  private subscription: Subscription;

  constructor(private logger: LoggerService, private fb: FormBuilder, private counterServices: CounterLCDService,
              private languageService: MultilingualService, private eventService: EventsService, private cdRef: ChangeDetectorRef,
              private stateService: StateService, private route: ActivatedRoute, public dialog: MatDialog, private commonService: CommonActionsService) {
      this.listenToEvents();
  }

  public async ngOnInit(): Promise<void> {
    try {
      this.isReady = this.stateService.getStatus() === InternalStatus.Ready;
      this.fillFormGroup(0);
      await this.getPermition();

      this.route.params.subscribe(async (params) => {
        if (params && (params.pid || params.PID)) {
          this.counter_LCD_ID = params.pid ? params.pid : params.PID;
          const result = await this.counterServices.getSettings(this.counter_LCD_ID);

          if (result === Result.Success) {
            this.counters = this.counterServices.counters;
            this.counterLCDConfiguration = this.counterServices.counterLCDConfiguration;
            this.fillFormGroup(this.counterLCDConfiguration.counterID);
          }
        }
      });
      this.loadCaptions();
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - Initialize the counters form
   * @param {number} id - selected counter ID
   */
  public async fillFormGroup(id: number): Promise<void> {
    try {
      this.countersForm = this.fb.group({
        counter: [id],
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
      const tResult = await this.counterServices.identify(this.counter_LCD_ID);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - gets the form values and save it if valid
   */
  public async saveConfiguration(): Promise<void> {
    try {
      const tTitle = this.languageService.getCaption(Constants.cSAVE_CONFIGURATION);
      let tSubTitle = this.languageService.getCaption(Constants.cWRONG_DATA);
      let tMessage = this.languageService.getCaption(Constants.cCHECK_INPUT);
      let tCancelText = this.languageService.getCaption(Constants.cCANCEL);
      const tYesText = this.languageService.getCaption(Constants.cOK);
      let tCallBack = null;

      const counterID = this.countersForm.get(Constants.cCOUNTER).value;
      if (!this.disabled && this.canEdit && counterID && counterID > 0) {
        this.counterLCDConfiguration.counterID = counterID;
        const result = await this.counterServices.setConfiguration(this.counter_LCD_ID, this.counterLCDConfiguration);

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
      await this.openDialog(tTitle, tSubTitle, tMessage, tCancelText, tYesText, tCallBack);
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
  public async openDialog(pTitle: string, pSubTitle: string, pMessage: string, pCancelText: string, pYesText: string, pCallBack?: any): Promise<void> {
    try {
      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          title: pTitle,
          subTitle: pSubTitle,
          message: pMessage,
          cancelText: pCancelText,
          yesText: pYesText,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (pCallBack) {
          pCallBack(result);
        }
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async afterSaveDialogClose(result: boolean): Promise<void> {
    try {
      // tslint:disable: no-console
      console.log('inside the callback');
      if (result) {
        console.log(result);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - load the captions of the component
   */
  public async loadCaptions(): Promise<void> {
    try {
      this.save = this.languageService.getCaption(Constants.cSAVE);
      this.identifyCaption = this.languageService.getCaption(Constants.cIDENTIFY);
      this.title = this.languageService.getCaption(Constants.cCOUNTER_LCD_CONFIGURATION);
      this.forCounter =  this.languageService.getCaption(Constants.cFOR_COUNTER);
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
   * @async
   * @summary - opens an error dialog
   * @param {number} errorCode - the code of error to get the caption
   */
  public async showError(pErrorCode: number, pAdditionalMessage?: string): Promise<void> {
    try {
      let tError = this.commonService.getErrorCaption(pErrorCode);
      const additionalMessageCaption = pAdditionalMessage ? ' ' + this.languageService.getCaption(pAdditionalMessage) : '';
      tError += additionalMessageCaption;

      await this.openDialog(Constants.cERROR, '', tError, '', Constants.cOK);
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
        this.handleStatusUpdate(state);
      });

      const tLanguageChangedSub = this.eventService.languageChanged.subscribe(() => {
        this.handleLanguageChange();
      });
      this.subscription.add(tLanguageChangedSub);

      const tUnAuthorizedActionSub = this.eventService.unAuthorizedAction.subscribe((entityName) => {
        if (entityName && entityName === Constants.cCOUNTER) {
          this.showError(Error.NotAllowed, Constants.cCOUNTER);
          this.disabled = true;
          this.counterLCDConfiguration = new CounterLCDConfiguration(0);
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

  public handleLanguageChange(): void {
    try {
      this.loadCaptions();
      if (!this.cdRef[Constants.cDESTROYED]) {
        this.cdRef.detectChanges();
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  public handleStatusUpdate(pState: InternalStatus): void {
    try {
      this.isReady = pState === InternalStatus.Ready;
      if (this.isReady) {
        this.loadCaptions();
        this.cdRef.detectChanges();
      }
    } catch (error) {
      this.logger.error(error);
    }
  }
}
