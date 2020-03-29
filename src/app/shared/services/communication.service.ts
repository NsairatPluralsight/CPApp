import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Message } from '../models/message';
import { EventsService } from './events.service';
import { LoggerService } from './logger.service';
import * as io from 'socket.io-client';
import { CacheService } from './cache.service';
import { Constants } from '../models/constants';
import { Result, LoginErrorCodes } from '../models/enum';
import { SessionStorageService } from './session-storage.service';
import { RequestResult } from '../models/request-result';
import { ConnectivityService } from './connectivity.service';
import { RefreshTokenData } from '../models/refresh-token-data';
import { AuthenticatedUser } from '../models/authenticated-User';

@Injectable()
export class CommunicationService {
  public serviceUrl = '/';
  public socket: any = null;

  constructor(private http: HttpClient, private eventsService: EventsService,
              private logger: LoggerService, private cacheService: CacheService,
              private sessionService: SessionStorageService, private connectivityService: ConnectivityService) { }

  /**
   * @async
   * @summary - connect socket io to the endpoint and listen to some events
   * @param {string} token - string token to connect with endpoint
   */
  public async initializeSocketIO(pToken: string): Promise<void> {
    try {
      if (this.socket === null) {
        this.socket = io(this.serviceUrl, { query: `${Constants.cTOKEN}=` + JSON.stringify(pToken) });

        this.socket.on(Constants.cENDPOINT_SERVICE_STATUS_UPDATE, (pMessage: Message) => {
          if (pMessage && pMessage.payload && pMessage.payload.servicesStatuses) {
            this.eventsService.servicesStatusUpdate.emit(pMessage);
          }
        });

        this.socket.on(Constants.cERROR, async (pError: any) => {
          const tError = JSON.parse(pError);
          if (tError.status && tError.status === 401) {
            await this.refreshToken(this.cacheService.getUser().refreshTokenData);
          }
        });

        this.socket.on(Constants.cDISCONNECT, async (pError: any) => {
          if (pError && pError === 'transport close') {
            this.connectivityService.handleEndPointServiceConnectivityChanged(false);
          }
        });

        this.socket.on(Constants.cENDPOINT_READY, (pData: Message) => {
          this.connectivityService.handleEndPointServiceConnectivityChanged(true, pData.time);
        });
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async initialize(pToken: string) {
    try {
      await this.initializeSocketIO(pToken);

      const tData: Message = await this.getInitialConnectivityReport();
      if (tData && tData.payload && tData.payload.servicesStatuses && !this.connectivityService.initialized) {
        this.connectivityService.initialize(tData.payload.servicesStatuses, tData.time);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async getInitialConnectivityReport(): Promise<any> {
    try {
      return new Promise<any>(async (resolve, reject) => {
        const tOptions = {
          headers: {
            'Content-Type': 'application/json',
          },
        };
        const tMessage: Message = new Message();
        tMessage.topicName = 'EndPoint/GetServicesStatusReport';
        const tAPI = Constants.cANONYMOUS_POST_MESSAGE;

        await this.http.post(tAPI, tMessage, tOptions).toPromise().then((data) => {
          resolve(data);
        }).catch(async (error) => {
          reject(undefined);
          return;
        });
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - close Socket.io connection
   */
  public async closeSocketIO(): Promise<void> {
    try {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

/**
 * @async
 * @summary Make a post request to the End point
 * @param {any} payload - the payload various by topic name.
 * @param {string} topicName - The ID of a branch.
 * @return {Promise<any>} - object wrapped in a promise.
 */
  public async post(pPayload: any, pTopicName: string): Promise<any> {
    try {
      const tReqMessage = new Message();
      tReqMessage.time = Date.now();
      tReqMessage.topicName = pTopicName;
      tReqMessage.payload = pPayload;

      const tToken = this.cacheService.getUser().token;
      const tOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + tToken,
        }),
      };

      return new Promise<object>(async (resolve, reject) => {
        await this.http.post<any>(Constants.cPOST_MESSAGE, tReqMessage, tOptions).toPromise()
          .then((data) => {
            resolve(data);
          })
          .catch(async (err) => {
            const tResult = await this.handleError(err, pTopicName);

            if (tResult.code === Result.Success) {
              resolve(this.post(pPayload, pTopicName));
            } else {
              resolve(tResult);
            }
          });
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary Make a post request to the End point
   * @param {any} payload - the payload various by topic name.
   * @param {string} topicName - The ID of a branch.
   * @return {Promise<object>} - object wrapped in a promise.
   */
  public async anonymousPost(pPayload: any, pTopicName: string): Promise<object> {
    try {
      const tReqMessage = new Message();
      tReqMessage.time = Date.now();
      tReqMessage.topicName = pTopicName;
      tReqMessage.payload = pPayload;

      return await this.http.post<any>(Constants.cANONYMOUS_POST_MESSAGE, tReqMessage, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
        .toPromise()
        .catch(async (err) => await this.handleError(err, Constants.cCVM_SERVER));
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - Make a post request to the End point used for Authentication
   * @param {string} url - the url to send the request to
   * @param {any} body - the body of the request
   * @param {any} options - object may contain headers or parameters etc.
   * @return {Promise<any>} - return response object wrapped in a promise.
   */
  public async authenticate(pURL: string, pBody: any, pOptions?: any): Promise<any> {
    try {
      return new Promise<object>(async (resolve, reject) => {
        await this.http.post<any>(pURL, pBody, pOptions).toPromise().then((data) =>
          resolve(data),
        ).catch(async (err) => {
          reject(await this.handleError(err, Constants.cCVM_SERVER));
        });
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async logout(): Promise<Result> {
    try {
      const tUser = this.cacheService.getUser();
      const tPayload = {
        id: tUser.userId,
      };
      const tToken = tUser.token;
      const tOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + tToken,
        }),
      };

      return new Promise<Result>(async (resolve, reject) => {
        await this.http.post<any>(Constants.cLOGOUT_URL, tPayload, tOptions).toPromise()
          .then((data) => {
            resolve(data);
          })
          .catch(async (err) => {
            const tResult = await this.handleError(err, 'logout');

            if (tResult.code === Result.Success) {
              resolve(this.logout());
            } else {
              resolve(tResult.code);
            }
          });
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - try to refresh the token
   * @param {string} refreshTokenData
   * @returns {Promise<Result>} - Result enum wrapped in a promise.
   */
  public async refreshToken(pRefreshTokenData: RefreshTokenData): Promise<Result> {
    try {
      let tResult = Result.Failed;
      const tOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      };

      await this.closeSocketIO();
      await this.authenticate(Constants.cREFRESH_TOKEN_URL, pRefreshTokenData, tOptions)
        .then(async (userData) => {
          if (userData) {
            const tAuthUser = new AuthenticatedUser();
            tAuthUser.username = userData.user.username;
            tAuthUser.userId = userData.user.id;
            tAuthUser.isSSO = false;
            tAuthUser.token = userData.token;
            tAuthUser.refreshTokenData = new RefreshTokenData(userData.refreshToken, userData.token);
            this.eventsService.setUser.emit(tAuthUser);
            await this.initializeSocketIO(tAuthUser.token);
            this.sessionService.raiseUserTokenRefreshed();
            tResult = Result.Success;
          }
        }).catch((error) => {
          if (error && error.code) {
            this.logger.error(error);
            this.eventsService.unAuthenticated.emit();
          }
        });
      return tResult;
    } catch (error) {
      this.logger.error(error);
      return Result.Failed;
    }
  }

  /**
   * @async
   * @summary Make a get request to the file
   * @param {string} filePath - The path of a file.
   * @return {Promise<any>} - any wrapped in a promise.
   */
  public async getFile(filePath: string): Promise<any> {
    try {
      return await this.http.get(filePath).toPromise();
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @async
   * @summary - refresh token by calling refresh mehtod if not sso or relogin if sso
   * @returns {Promise<number>} - number error code wrapped in a promise.
   */
  public async handleRefreshToken(): Promise<number> {
    let result: number = Result.Failed;
    try {
      const tCachedAuthUser: AuthenticatedUser = this.cacheService.getUser();

      if (tCachedAuthUser.isSSO) {
        await this.authenticate(Constants.cSSO_REFRESH_TOKEN_URL, tCachedAuthUser.refreshTokenData, { withCredentials: true }).then(async (userData) => {
          if (userData) {
            const tAuthUser = new AuthenticatedUser();
            tAuthUser.username = userData.user.username;
            tAuthUser.userId = userData.user.id;
            tAuthUser.isSSO = true;
            tAuthUser.token = userData.token;
            tAuthUser.refreshTokenData = new RefreshTokenData(userData.refreshToken, userData.token);
            this.eventsService.setUser.emit(tAuthUser);
            result = LoginErrorCodes.Success;
          }
        }).catch((error) => {
          if (error && error.code) {
            this.logger.error(error);
            result = error.code;
          }
        });
      } else {
        result = await this.refreshToken(tCachedAuthUser.refreshTokenData);
      }
      return result;
    } catch (error) {
      this.logger.error(error);
      return result;
    }
  }

  /**
   * @async
   * @summary Handles Error catched from http request
   * @param {HttpErrorResponse} err - the payload various by topic name.
   * @return {Promise<RequestResult>} - RequestResult wrapped in a promise.
   */
  private async handleError(pHttpError: HttpErrorResponse, pTopic: string): Promise<RequestResult> {
    const tResult = new RequestResult();
    try {
      if (pHttpError.status || pHttpError.status === 0) {
        tResult.code = pHttpError.status;
        if (pHttpError.url.includes(Constants.cLOGIN_URL) || pHttpError.url.includes(Constants.cSSO_LOGIN_URL)) {
          tResult.code = pHttpError.error.errorCode;
        } else if (pHttpError.url.includes(Constants.cPOST_MESSAGE) && !pHttpError.url.includes(Constants.cANONYMOUS_POST_MESSAGE)) {
          if (pHttpError.status === 401) {
            tResult.code = await this.handleRefreshToken();
          } else {
            const tObject = { error: pHttpError, topic: pTopic };
            this.eventsService.reconnect.emit(tObject);
          }
        } else if (pHttpError.url.includes(Constants.cLOGOUT_URL)) {
          if (pHttpError.status === 401) {
            tResult.code = await this.handleRefreshToken();
          } else {
            this.eventsService.unAuthorized.emit(pHttpError);
          }
        } else if (pHttpError.url.includes(Constants.cREFRESH_TOKEN_URL)) {
          this.eventsService.unAuthorized.emit(pHttpError);
        }
      } else {
        tResult.code = LoginErrorCodes.Error;
      }
      return tResult;
    } catch (error) {
      this.logger.error(error);
      tResult.code = LoginErrorCodes.Error;
      return tResult;
    }
  }
}
