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
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  loginForm: FormGroup;
  userNameCaption: string;
  passwordCaption: string;
  signinCaption: string;
  languages: Language[];
  selectedLanguageID = 1;
  showLoginForm: boolean;
  showLanguage: boolean;
  continue: string;
  languageDirection: string;
  serverError: string = Constants.cERROR_CONNECTING_TO_SERVER;

  constructor(private logger: LoggerService, public languageService: MultilingualService,
    private eventService: EventsService, private session: SessionStorageService,
    private cdRef: ChangeDetectorRef, private fb: FormBuilder, public dialog: MatDialog,
    private authService: AuthenticationService, private router: Router, private cacheService: CacheService,
    private commonService: CommonActionsService, private route: ActivatedRoute) {
    this.listenToEvents();
  }

  async ngOnInit(): Promise<void> {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
    });
    let language = this.cacheService.getCurrentLanguage();
    if (language) {
      this.selectedLanguageID = language.id;
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
  loadCaptions(): void {
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
  async trySSO() {
    try {
      let result = this.cacheService.getIsDiffrentUser();

      if(!result) {
        let loginResult = await this.authService.SSOLogin();

        if (loginResult === LoginErrorCodes.Success) {
          result = await this.commonService.checkUserPermission();
          if (!result) {
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
  async login(): Promise<void> {
    try {
      let userName = this.loginForm.get(Constants.cUSER_NAME_LCC).value;
      let password = this.loginForm.get(Constants.cPASSWORD.toLowerCase()).value;

      let result = await this.authService.login(userName, password);

      if (result == LoginErrorCodes.Success) {

        let isAuthorized = await this.commonService.checkUserPermission();

        if (isAuthorized) {
          this.goToMainPage();
        } else {
          this.showError(Error.NotAllowed);
        }
      } else {
        this.showError(result);
      }

    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - redirect user to main page and rais user login event
   */
  goToMainPage() {
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
  async showError(errorCode: number): Promise<void> {
    try {
      let error = this.commonService.getErrorCaption(errorCode);

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

  /**
   * @summary - change language
   * @param id - language id
   */
  async languageChange(id: number): Promise<void> {
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
  listenToEvents(): void {
    try {

      this.subscription = this.eventService.languageChanged.subscribe(() => {
        this.loadCaptions();
        if (!this.cdRef[Constants.cDESTROYED]) {
          this.cdRef.detectChanges();
        }
      });

      const routeSub = this.route.queryParams.subscribe(async params => {
        if (params && params.error) {
          await this.showError(parseInt(params.error));
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
  ngOnDestroy(): void {
    try {
      this.subscription.unsubscribe();
    } catch (error) {
      this.logger.error(error);
    }
  }
}
