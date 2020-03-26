import { Component, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { LoggerService } from '../services/logger.service';
import { CacheService } from '../services/cache.service';
import { EventsService } from '../services/events.service';
import { Constants } from '../models/constants';
import { MultilingualService } from '../services/multilingual.service';
import { AuthenticatedUser } from '../models/user';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.css']
})
export class UserMenuComponent implements OnInit, AfterViewChecked {
  userName: string;
  showMenu: boolean;
  logoutCaption: string;
  differentUser: string;

  constructor(private logger: LoggerService, private cacheService: CacheService,private cdRef: ChangeDetectorRef,
    private eventsService: EventsService, public languageService: MultilingualService) { }

  /**
   * @summary - calls intilize
   */
  ngOnInit(): void {
    try {
      this.initialize();
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary - calls intilize to handle routing
   */
  ngAfterViewChecked(): void {
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
  initialize(): void {
    try {
      let user: AuthenticatedUser = this.cacheService.getUser();

      if (user) {
        this.userName = user.username;
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
  logout(isDiffrent: boolean): void {
    try {
      if(isDiffrent) {
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
  isSigninPage(): boolean{
    try {
      let isSigninPage = location.href.includes(Constants.cSIGNIN.toLocaleLowerCase());
      return isSigninPage;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
