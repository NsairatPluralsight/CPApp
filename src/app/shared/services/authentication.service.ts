import { Injectable } from '@angular/core';
import { LoginErrorCodes, Result } from '../models/enum';
import { CommunicationService } from './communication.service';
import { LoggerService } from './logger.service';
import { Constants } from '../models/constants';
import { CacheService } from './cache.service';
import { loginUserData, AuthenticatedUser, RefreshTokenData } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private communication: CommunicationService, private logger: LoggerService, private cacheService: CacheService) {
  }

  /**
   * @async
   * @summary - try to login to system and obtain token and refresh token
   * @returns {Promise<LoginErrorCodes>} - LoginErrorCodes enum wrapped in a promise.
   */
  async SSOLogin(): Promise<LoginErrorCodes> {
    try {
      let result = LoginErrorCodes.Error;

      let payload = {
        applicationName: Constants.cCOMPONENT_PORTAL
      }

      await this.communication.authenticate(Constants.cSSO_LOGIN_URL, payload, { withCredentials: true }).then(async userData => {
        if (userData) {
          let authUser = new AuthenticatedUser();
          authUser.username = userData.user.username;
          authUser.userId = userData.user.id;
          authUser.isSSO = true;
          authUser.token = userData.token;
          authUser.refreshTokenData = new RefreshTokenData(userData.refreshToken, userData.token);
          await this.setUser(authUser);
          result = LoginErrorCodes.Success;
        }
      }).catch(error => {
        if (error && error.code) {
          this.logger.error(error);
          result = error.code;
        }
      });

      return result;
    } catch (error) {
      this.logger.error(error);
      return LoginErrorCodes.Error;
    }
  }

  /**
 * @async
 * @summary - try to login to system and obtain token and refresh token
 * @param {string} userName - the user name used for login
 * @param {string} password - the password belong to the user
 * @returns {Promise<LoginErrorCodes>} - Result enum wrapped in a promise.
 */
  async login(userName: string, password: string): Promise<LoginErrorCodes> {
    try {
      let result = LoginErrorCodes.Error;
      let user = new loginUserData();
      user.username = userName;
      user.password = password;
      user.applicationName = Constants.cCOMPONENT_PORTAL;

      await this.communication.authenticate(Constants.cLOGIN_URL, user)
        .then(async userData => {
          if (userData) {
            let authUser = new AuthenticatedUser();
            authUser.username = userData.user.username;
            authUser.userId = userData.user.id;
            authUser.isSSO = false;
            authUser.token = userData.token;
            authUser.refreshTokenData = new RefreshTokenData(userData.refreshToken, userData.token);
            await this.setUser(authUser);
            result = LoginErrorCodes.Success;
          }
        }).catch(error => {
          if (error && error.code) {
            this.logger.error(error);
            result = error.code;
          }
        });

      return result;
    } catch (error) {
      this.logger.error(error);
      return LoginErrorCodes.Error;
    }
  }

  /**
   * @async
   * @summary - set the Auth user and cache it
   * @param {any} user - Auth user contains credentials sent from endpoint
   */
  async setUser(user: any): Promise<void> {
    try {
      this.cacheService.setUser(user);
      await this.communication.initialize(user.token);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
