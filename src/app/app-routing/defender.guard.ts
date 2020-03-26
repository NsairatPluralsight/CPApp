import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { LoginErrorCodes, Error } from '../shared/models/enum';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { AuthenticationService } from '../shared/services/authentication.service';
import { CacheService } from '../shared/services/cache.service';
import { LoggerService } from '../shared/services/logger.service';
import { Constants } from '../shared/models/constants';
import { CommonActionsService } from '../shared/services/common-actions.service';

@Injectable({
  providedIn: 'root'
})
export class DefenderGuard implements CanActivate {

  constructor(private logger: LoggerService, private session: SessionStorageService,
    private authService: AuthenticationService, private cache: CacheService, private router: Router) {
    this.session.getDataFromOtherTabs();
  }

  /**
   * @async
   * @summary - check if user is authnticated so he can active the desired Route
   * @param {ActivatedRouteSnapshot} next - the Route the user want access
   * @param {RouterStateSnapshot} state - a multiple nodes of routes
   * @returns {Promise<boolean>} - a boolean wrapped in a promise.
   */
  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {
    try {
      let result = false;

      await this.startLoadingTimer();

      let user = this.cache.getUser();

      if (user) {
        await this.authService.setUser(user);
        result = true;
      }

      if (next.routeConfig.path.includes(Constants.cSIGNIN.toLocaleLowerCase())) {
        if (result) {
          this.router.navigate([`/${Constants.cDEVICES}`]);
        } else {
          result = true;
        }
      }

      if (!result) {
        this.router.navigate([`/${Constants.cLOGIN}`]);
      }

      return result;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  /**
   * @async
   * @summary - wait 100 miliseconds to insure that the cache is filled
   */
  async startLoadingTimer() {
    return new Promise<object>(async (resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  }
}
