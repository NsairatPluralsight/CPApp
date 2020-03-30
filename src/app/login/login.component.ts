import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { LoggerService } from '../shared/services/logger.service';
import { MultilingualService } from '../shared/services/multilingual.service';
import { EventsService } from '../shared/services/events.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../shared/services/authentication.service';
import { LoginErrorCodes, Error } from '../shared/models/enum';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { Constants } from '../shared/models/constants';
import { CommonActionsService } from '../shared/services/common-actions.service';
import { DialogComponent } from '../shared/components/dialog.component';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { CacheService } from '../shared/services/cache.service';
import { Language } from '../shared/models/language';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  public loginForm: FormGroup;
  public userNameCaption: string;
  public passwordCaption: string;
  public signinCaption: string;
  public languages: Language[];
  public selectedLanguageID = 1;
  public showLoginForm: boolean;
  public showLanguage: boolean;
  public continue: string;
  public languageDirection: string;
  public serverError: string = Constants.cERROR_CONNECTING_TO_SERVER;
  private subscription: Subscription;

  constructor(private logger: LoggerService, public languageService: MultilingualService,
              private eventService: EventsService, private session: SessionStorageService,
              private cdRef: ChangeDetectorRef, private fb: FormBuilder, public dialog: MatDialog,
              private authService: AuthenticationService, private router: Router, private cacheService: CacheService,
              private commonService: CommonActionsService, private route: ActivatedRoute) {
    this.listenToEvents();
  }

  public async ngOnInit(): Promise<void> {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
    });
    const tLanguage = this.cacheService.getCurrentLanguage();
    if (tLanguage) {
      this.selectedLanguageID = tLanguage.id;
    }
    await this.languageChange(this.selectedLanguageID);
    if (this.languages) {
      this.showLanguage = true;
    }
    this.loadCaptions();
    await this.trySSO();
  }

  /**
   * @summary - get the text caption for the component
   */
  public loadCaptions(): void {
    try {
      this.languageDirection = this.cacheService.getCurrentLanguage().rtl === 1 ? Constants.cRTL : Constants.cLTR;
      this.userNameCaption = this.languageService.getCaption(Constants.cUSER_NAME);
      this.passwordCaption = this.languageService.getCaption(Constants.cPASSWORD);
      this.signinCaption = this.languageService.getCaption(Constants.cSIGNIN);
      this.serverError = this.languageService.getCaption(Constants.cERROR_CONNECTING_TO_SERVER_Key);
      this.continue = this.languageService.getCaption(Constants.cCONTINUE);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - try to login using windows user
   */
  public async trySSO() {
    try {
      let tResult = this.cacheService.getIsDiffrentUser();

      if (!tResult) {
        const tLoginResult = await this.authService.SSOLogin();

        if (tLoginResult === LoginErrorCodes.Success) {
          tResult = await this.commonService.checkUserPermission();
          if (!tResult) {
            this.showError(Error.NotAllowed);
          } else {
            this.showLoginForm = false;
            this.showLanguage = true;
          }
        } else {
          this.showLoginForm = true;
          this.showLanguage = true;
        }
      } else {
        this.showLoginForm = true;
        this.showLanguage = true;
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - get login information from form and try to login
   */
  public async login(): Promise<void> {
    try {
      const tUserName = this.loginForm.get(Constants.cUSER_NAME_LCC).value;
      const tPassword = this.loginForm.get(Constants.cPASSWORD.toLowerCase()).value;

      const tResult = await this.authService.login(tUserName, tPassword);

      if (tResult === LoginErrorCodes.Success) {
        const tIsAuthorized = await this.commonService.checkUserPermission();

        if (tIsAuthorized) {
          this.goToMainPage();
        } else {
          this.showError(Error.NotAllowed);
        }
      } else {
        this.showError(tResult);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - redirect user to main page and rais user login event
   */
  public goToMainPage() {
    try {
      this.session.raiseUserLogin();
      this.cacheService.setIsDiffrentUser(null);
      this.router.navigate([`/${Constants.cDEVICES}`]);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - opens an error dialog
   * @param {number} errorCode - the code of error to get the caption
   */
  public async showError(pErrorCode: number): Promise<void> {
    try {
      const error = this.commonService.getErrorCaption(pErrorCode);

      await this.openDialog(Constants.cERROR, '', error, '', Constants.cOK);
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

  /**
   * @summary - change language
   * @param id - language id
   */
  public async languageChange(id: number): Promise<void> {
    try {
      await this.languageService.loadLanguage(id);
      this.languages = this.languageService.languages;
      // this.languageDirection = this.languageService.
      this.loadCaptions();
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - subscribes to events
   */
  public listenToEvents(): void {
    try {
      this.subscription = this.eventService.languageChanged.subscribe(() => {
        this.loadCaptions();
        if (!this.cdRef[Constants.cDESTROYED]) {
          this.cdRef.detectChanges();
        }
      });

      const routeSub = this.route.queryParams.subscribe(async (params) => {
        if (params && params.error) {
          await this.showError(parseInt(params.error, 0));
        }
      });
      this.subscription.add(routeSub);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - unsubscribes to events
   */
  public ngOnDestroy(): void {
    try {
      this.subscription.unsubscribe();
    } catch (error) {
      this.logger.error(error);
    }
  }
}
