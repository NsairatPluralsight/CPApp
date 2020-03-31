import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoggerService } from './shared/services/logger.service';
import { MultilingualService } from './shared/services/multilingual.service';
import { Language } from './shared/models/language';
import { EventsService } from './shared/services/events.service';
import { StateService } from './shared/services/state.service';
import { InternalStatus, Error } from './shared/models/enum';
import { CacheService } from './shared/services/cache.service';
import { Router } from '@angular/router';
import { SessionStorageService } from './shared/services/session-storage.service';
import { CommunicationService } from './shared/services/communication.service';
import { Subscription } from 'rxjs';
import { Constants } from './shared/models/constants';
import { ConnectivityService } from './shared/services/connectivity.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  public connectingCaption: string;
  public title: string;
  public direction = Constants.cLTR;
  public showConnecting = false;
  private subscription: Subscription;

  constructor(private logger: LoggerService, private router: Router, private communicationService: CommunicationService,
              private eventsService: EventsService, private stateService: StateService, private cacheService: CacheService,
              private session: SessionStorageService, private connectivityService: ConnectivityService, public languageService: MultilingualService) {
    this.listenToEvents();
  }

  public async ngOnInit(): Promise<void> {
    try {
      this.stateService.setStatus(InternalStatus.Ready);
      await this.languageService.initialize();
      this.loadCaptions();
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - logout user and inform others
   * @param queryParams - oprional to send query string with url
   */
  public logout(queryParams?: any): void {
    try {
      this.session.raiseUserLogout();
      this.handleLogout(queryParams);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - delete user info and redirect to login page
   * @param queryParams - oprional to send query string with url
   */
  public handleLogout(queryParams?: any): void {
    try {
      this.communicationService.logout();
      this.connectivityService.reset();
      this.communicationService.closeSocketIO();
      this.session.storeData(`${Constants.cSESSION_PREFIX}${Constants.cUSER}`, null);

      if (queryParams) {
        this.router.navigate([Constants.cSIGNIN], queryParams);
      } else {
        this.router.navigate([Constants.cSIGNIN]);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - subscribes to events
   */
  public listenToEvents(): void {
    try {
      this.subscription = this.eventsService.languageChanged.subscribe((language: Language) => {
        this.direction = language.rtl === 1 ? Constants.cRTL : Constants.cLTR;
        this.loadCaptions();
      });

      const unAuthenticatedSub = this.eventsService.unAuthenticated.subscribe(() => {
        this.cacheService.setUser(null);
        this.router.navigate([Constants.cSIGNIN]);
      });
      this.subscription.add(unAuthenticatedSub);

      const setUserSub = this.eventsService.setUser.subscribe((user) => {
        this.handleSetUser(user);
      });
      this.subscription.add(setUserSub);

      const loginUserSub = this.eventsService.loginUser.subscribe(() => {
        this.router.navigate([Constants.cDEVICES]);
      });
      this.subscription.add(loginUserSub);

      const logoutUserSub = this.eventsService.logoutUser.subscribe(() => {
        this.handleLogout();
      });
      this.subscription.add(logoutUserSub);

      const unAuthorizedSub = this.eventsService.unAuthorized.subscribe(() => {
        this.logout({ queryParams: { error: Error.Unauthorized } });
        this.showConnecting = false;
      });
      this.subscription.add(unAuthorizedSub);

      const disconnect = this.eventsService.onDisconnect.subscribe(() => {
        this.logout({ queryParams: { error: Error.Disconnected } });
        this.showConnecting = false;
        this.stateService.setStatus(InternalStatus.Ready);
      });
      this.subscription.add(disconnect);

      const envStatusChanged = this.eventsService.connectivityChanged.subscribe(() => {
        this.handleConnectivityChange();
      });
      this.subscription.add(envStatusChanged);

    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - get the text caption for the component
   */
  public loadCaptions(): void {
    try {
      this.connectingCaption = this.languageService.getCaption(Constants.cCONNECTING);
      this.title = this.languageService.getCaption(Constants.cCOMPONENT_PORTAL);
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

  public handleConnectivityChange() {
    try {
      const isConnected = this.connectivityService.isConnected();

      if (isConnected) {
        this.showConnecting = false;
        this.stateService.setStatus(InternalStatus.Ready);
        this.eventsService.reboot.emit();
      } else {
        this.showConnecting = true;
        this.stateService.setStatus(InternalStatus.Connecting);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  public handleSetUser(pUser: any) {
    try {
      const oldUserData = this.cacheService.getUser();
      pUser[Constants.cPERMISSION] = oldUserData.permission;
      this.cacheService.setUser(pUser);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
