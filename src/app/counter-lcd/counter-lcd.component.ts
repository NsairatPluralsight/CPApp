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
import { Subscription } from "rxjs";
import { Constants } from '../shared/models/constants';
import { CommonActionsService } from '../shared/services/common-actions.service';

@Component({
  selector: 'app-counter-lcd',
  templateUrl: './counter-lcd.component.html',
  styleUrls: ['./counter-lcd.component.css']
})
export class CounterLCDComponent implements OnInit, OnDestroy {
  countersForm: FormGroup;
  counters: Counter[];
  counterLCDConfiguration: CounterLCDConfiguration;
  counter_LCD_ID: number;
  save: string;
  identifyCaption: string;
  title: string;
  forCounter: string;
  private subscription: Subscription;
  disabled = false;
  isReady = false;
  canEdit = true;

  constructor(private logger: LoggerService, private fb: FormBuilder, private counterServices: CounterLCDService,
    private languageService: MultilingualService, private eventService: EventsService, private cdRef: ChangeDetectorRef,
    private stateService: StateService, private route: ActivatedRoute, public dialog: MatDialog, private commonService: CommonActionsService) {
      this.listenToEvents();
  }

  async ngOnInit(): Promise<void> {
    try {
      this.isReady = this.stateService.getStatus() === InternalStatus.Ready;
      this.fillFormGroup(0);

      await this.getPermition();

      this.route.params.subscribe(async params => {
        if (params && (params.pid || params.PID)) {
          this.counter_LCD_ID = params.pid ? params.pid : params.PID;
          let result = await this.counterServices.getSettings(this.counter_LCD_ID);

          if (result == Result.Success) {

            this.counters = this.counterServices.counters;
            this.counterLCDConfiguration = this.counterServices.counterLCDConfiguration
            this.fillFormGroup(this.counterLCDConfiguration.counterID);

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
   * @async
   * @summary - Initialize the counters form
   * @param {number} id - selected counter ID
   */
  async fillFormGroup(id: number): Promise<void> {
    try {
      this.countersForm = this.fb.group({
        counter: [id]
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
      let result = await this.counterServices.identify(this.counter_LCD_ID);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - gets the form values and save it if valid
   */
  async saveConfiguration(): Promise<void> {
    try {
      let title = this.languageService.getCaption(Constants.cSAVE_CONFIGURATION);
      let subTitle = this.languageService.getCaption(Constants.cWRONG_DATA);
      let message = this.languageService.getCaption(Constants.cCHECK_INPUT);
      let cancelText = this.languageService.getCaption(Constants.cCANCEL);
      let yesText = this.languageService.getCaption(Constants.cOK);
      let callBack = null;

      let counterID = this.countersForm.get(Constants.cCOUNTER).value;
      if (!this.disabled && this.canEdit && counterID && counterID > 0) {

        this.counterLCDConfiguration.counterID = counterID;
        let result = await this.counterServices.setConfiguration(this.counter_LCD_ID, this.counterLCDConfiguration);

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

      await this.openDialog(title, subTitle, message, cancelText, yesText, callBack);

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
  async openDialog(title: string, subTitle: string, message: string, cancelText: string, yesText: string, callBack?: any): Promise<void> {
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
          callBack(result);
        }
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  async afterSaveDialogClose(result: boolean): Promise<void> {
    try {
      console.log('inside the callback');
      if (result) {
        console.log(result);
      } else {

      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - load the captions of the component
   */
  async loadCaptions(): Promise<void> {
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
  async getPermition(): Promise<void> {
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

      const languageChangedSub = this.eventService.languageChanged.subscribe(() => {
        this.loadCaptions();
        if (!this.cdRef[Constants.cDESTROYED]) {
          this.cdRef.detectChanges();
        }
      });

      this.subscription.add(languageChangedSub);

      const unAuthorizedActionSub = this.eventService.unAuthorizedAction.subscribe((entityName) => {
        if (entityName && entityName === Constants.cCOUNTER) {
          this.showError(Error.NotAllowed, Constants.cCOUNTER);
          this.disabled = true;
          this.counterLCDConfiguration = new CounterLCDConfiguration(0);
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
