import { Injectable } from '@angular/core';
import { LoginErrorCodes, Result } from '../models/enum';
import { CommunicationService } from './communication.service';
import { LoggerService } from './logger.service';
import { Constants } from '../models/constants';
import { CacheService } from './cache.service';
import { LoginUserData } from '../models/user';
import { AuthenticatedUser } from '../models/authenticated-User';
import { RefreshTokenData } from '../models/refresh-token-data';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {

  constructor(private communication: CommunicationService, private logger: LoggerService, private cacheService: CacheService) {
  }

  /**
   * @async
   * @summary - try to login to system and obtain token and refresh token
   * @returns {Promise<LoginErrorCodes>} - LoginErrorCodes enum wrapped in a promise.
   */
  public async SSOLogin(): Promise<LoginErrorCodes> {
    try {
      let result = LoginErrorCodes.Error;
      const tPayload = {
        applicationName: Constants.cCOMPONENT_PORTAL,
      };

      await this.communication.authenticate(Constants.cSSO_LOGIN_URL, tPayload, { withCredentials: true }).then(async (pUserData) => {
        if (pUserData) {
          const tAuthUser = new AuthenticatedUser();
          tAuthUser.username = pUserData.user.username;
          tAuthUser.userId = pUserData.user.id;
          tAuthUser.isSSO = true;
          tAuthUser.token = pUserData.token;
          tAuthUser.refreshTokenData = new RefreshTokenData(pUserData.refreshToken, pUserData.token);
          await this.setUser(tAuthUser);
          result = LoginErrorCodes.Success;
        }
      }).catch((error) => {
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
  public async login(userName: string, password: string): Promise<LoginErrorCodes> {
    try {
      let result = LoginErrorCodes.Error;
      const pUser = new LoginUserData();
      pUser.username = userName;
      pUser.password = password;
      pUser.applicationName = Constants.cCOMPONENT_PORTAL;

      await this.communication.authenticate(Constants.cLOGIN_URL, pUser)
        .then(async (pUserData) => {
          if (pUserData) {
            const tAuthUser = new AuthenticatedUser();
            tAuthUser.username = pUserData.user.username;
            tAuthUser.userId = pUserData.user.id;
            tAuthUser.isSSO = false;
            tAuthUser.token = pUserData.token;
            tAuthUser.refreshTokenData = new RefreshTokenData(pUserData.refreshToken, pUserData.token);
            await this.setUser(tAuthUser);
            result = LoginErrorCodes.Success;
          }
        }).catch((error) => {
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
  public async setUser(user: any): Promise<void> {
    try {
      this.cacheService.setUser(user);
      await this.communication.initialize(user.token);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
