import { Component, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { LoggerService } from '../services/logger.service';
import { CacheService } from '../services/cache.service';
import { EventsService } from '../services/events.service';
import { Constants } from '../models/constants';
import { MultilingualService } from '../services/multilingual.service';
import { AuthenticatedUser } from '../models/authenticated-User';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.css'],
})
export class UserMenuComponent implements OnInit, AfterViewChecked {
  public userName: string;
  public showMenu: boolean;
  public logoutCaption: string;
  public differentUser: string;

  constructor(private logger: LoggerService, private cacheService: CacheService, private cdRef: ChangeDetectorRef,
              private eventsService: EventsService, public languageService: MultilingualService) { }

  /**
   * @summary - calls intilize
   */
  public ngOnInit(): void {
    try {
      this.initialize();
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - calls intilize to handle routing
   */
  public ngAfterViewChecked(): void {
    try {
      this.initialize();
      this.cdRef.detectChanges();
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - get user name and show user menu
   */
  public initialize(): void {
    try {
      const tUser: AuthenticatedUser = this.cacheService.getUser();

      if (tUser) {
        this.userName = tUser.username;
        this.logoutCaption = this.languageService.getCaption(Constants.cLOGOUT);
        this.differentUser = this.languageService.getCaption(Constants.cLOGIN_WITH_DIFFRENT_USER);
        this.showMenu = !this.isSigninPage();
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - emit log out user and hide menu
   */
  public logout(pIsDiffrent: boolean): void {
    try {
      if (pIsDiffrent) {
        this.cacheService.setIsDiffrentUser(true);
      }
      this.eventsService.logoutUser.emit();
      this.showMenu = false;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - returns whether the active page is signin or not
   * @returns {boolean}
   */
  public isSigninPage(): boolean {
    try {
      const tIsSigninPage = location.href.includes(Constants.cSIGNIN.toLocaleLowerCase());
      return tIsSigninPage;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
