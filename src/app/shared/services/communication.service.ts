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
import { AuthenticatedUser, RefreshTokenData } from '../models/user';
import { ConnectivityService } from './connectivity.service';

@Injectable()
export class CommunicationService {
  serviceUrl = '/';
  socket: any = null;

  constructor(private http: HttpClient, private eventsService: EventsService,
    private logger: LoggerService, private cacheService: CacheService,
    private sessionService: SessionStorageService, private connectivityService: ConnectivityService) { }

  /**
    * @async
    * @summary - connect socket io to the endpoint and listen to some events
    * @param {string} token - string token to connect with endpoint
    */
  async initializeSocketIO(token: string): Promise<void> {
    try {

      if (this.socket === null) {
        this.socket = io(this.serviceUrl, { query: `${Constants.cTOKEN}=` + JSON.stringify(token) });

        this.socket.on(Constants.cENDPOINT_SERVICE_STATUS_UPDATE, (message: Message) => {
          if (message && message.payload && message.payload.servicesStatuses) {
            this.eventsService.servicesStatusUpdate.emit(message);
          }
        });

        this.socket.on(Constants.cERROR, async (pError: any) => {
          let error = JSON.parse(pError);

          if (error.status && error.status == 401) {
            await this.refreshToken(this.cacheService.getUser().refreshTokenData);
          }
        });


        this.socket.on(Constants.cDISCONNECT, async (error: any) => {

          if (error && error === "transport close") {
            this.connectivityService.handleEndPointServiceConnectivityChanged(false);
          }
          /*           if (pError) {
                      console.log(pError); */
          /*    let error = JSON.parse(pError);
             if (error && error.status && error.status == 401) {
               await this.refreshToken(this.cacheService.getUser().refreshToken);
             } */
          /* } else {
            this.connectivityService.handleEndPointServiceConnectivityChanged(false);
          } */
        });

        this.socket.on(Constants.cENDPOINT_READY, (data: Message) => {
          this.connectivityService.handleEndPointServiceConnectivityChanged(true, data.time);
        });
      }

    } catch (error) {
      this.logger.error(error);
    }
  }

  async initialize(token: string) {
    try {

      await this.initializeSocketIO(token);

      let data: Message = await this.getInitialConnectivityReport();
      if (data && data.payload && data.payload.servicesStatuses && !this.connectivityService.initialized) {
        this.connectivityService.initialize(data.payload.servicesStatuses, data.time);
      }

    } catch (error) {
      this.logger.error(error);
    }
  }


  async getInitialConnectivityReport(): Promise<any> {
    try {

      return new Promise<any>(async (resolve, reject) => {

        const options = {
          headers: {
            'Content-Type': 'application/json'
          }
        };
        const message: Message = new Message();
        message.topicName = "EndPoint/GetServicesStatusReport";
        let api = Constants.cANONYMOUS_POST_MESSAGE;

        await this.http.post(api, message, options).toPromise().then((data) => {
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
  async closeSocketIO(): Promise<void> {
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
  async post(payload: any, topicName: string): Promise<any> {
    try {
      let reqMessage = new Message();
      reqMessage.time = Date.now();
      reqMessage.topicName = topicName;
      reqMessage.payload = payload;

      let token = this.cacheService.getUser().token;
      let options = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };

      return new Promise<object>(async (resolve, reject) => {
        await this.http.post<any>(Constants.cPOST_MESSAGE, reqMessage, options).toPromise()
          .then((data) => {
            resolve(data);
          })
          .catch(async (err) => {
            let result = await this.handleError(err, topicName);

            if (result.code == Result.Success) {
              resolve(this.post(payload, topicName));
            } else {
              resolve(result);
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
  async anonymousPost(payload: any, topicName: string): Promise<object> {

    let reqMessage = new Message();
    reqMessage.time = Date.now();
    reqMessage.topicName = topicName;
    reqMessage.payload = payload;

    return await this.http.post<any>(Constants.cANONYMOUS_POST_MESSAGE, reqMessage, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    })
      .toPromise()
      .catch(async (err) => await this.handleError(err, Constants.cCVM_SERVER));
  }

  /**
   * @async
   * @summary - Make a post request to the End point used for Authentication
   * @param {string} url - the url to send the request to
   * @param {any} body - the body of the request
   * @param {any} options - object may contain headers or parameters etc.
   * @return {Promise<any>} - return response object wrapped in a promise.
   */
  async authenticate(url: string, body: any, options?: any): Promise<any> {
    try {
      return new Promise<object>(async (resolve, reject) => {
        await this.http.post<any>(url, body, options).toPromise().then(data =>
          resolve(data)
        ).catch(async err => {
          reject(await this.handleError(err, Constants.cCVM_SERVER));
        });
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  async logout(): Promise<Result> {
    try {
      let user = this.cacheService.getUser();
      let payload = {
        id: user.userId
      }
      let token = user.token;
      let options = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };

      return new Promise<Result>(async (resolve, reject) => {
        await this.http.post<any>(Constants.cLOGOUT_URL, payload, options).toPromise()
          .then((data) => {
            resolve(data);
          })
          .catch(async (err) => {
            let result = await this.handleError(err, "logout");

            if (result.code == Result.Success) {
              resolve(this.logout());
            } else {
              resolve(result.code);
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
  async refreshToken(refreshTokenData: RefreshTokenData): Promise<Result> {
    try {
      let result = Result.Failed;

      let options = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        })
      };

      await this.closeSocketIO();
      await this.authenticate(Constants.cREFRESH_TOKEN_URL, refreshTokenData, options)
        .then(async userData => {
          if (userData) {
            let authUser = new AuthenticatedUser();
            authUser.username = userData.user.username;
            authUser.userId = userData.user.id;
            authUser.isSSO = false;
            authUser.token = userData.token;
            authUser.refreshTokenData = new RefreshTokenData(userData.refreshToken, userData.token);
            this.eventsService.setUser.emit(authUser);
            await this.initializeSocketIO(authUser.token);
            this.sessionService.raiseUserTokenRefreshed();
            result = Result.Success;
          }
        }).catch(error => {
          if (error && error.code) {
            this.logger.error(error);
            this.eventsService.unAuthenticated.emit();
          }
        });

      return result;
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
  async getFile(filePath: string): Promise<any> {
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
  async handleRefreshToken(): Promise<number> {
    let result: number = Result.Failed;
    try {
      let cachedAuthUser: AuthenticatedUser = this.cacheService.getUser();

      if (cachedAuthUser.isSSO) {
        await this.authenticate(Constants.cSSO_REFRESH_TOKEN_URL, cachedAuthUser.refreshTokenData, { withCredentials: true }).then(async userData => {
          if (userData) {
            let authUser = new AuthenticatedUser();
            authUser.username = userData.user.username;
            authUser.userId = userData.user.id;
            authUser.isSSO = true;
            authUser.token = userData.token;
            authUser.refreshTokenData = new RefreshTokenData(userData.refreshToken, userData.token);
            this.eventsService.setUser.emit(authUser);
            result = LoginErrorCodes.Success;
          }
        }).catch(error => {
          if (error && error.code) {
            this.logger.error(error);
            result = error.code;
          }
        });
      } else {
        result = await this.refreshToken(cachedAuthUser.refreshTokenData);
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
  private async handleError(httpError: HttpErrorResponse, topic: string): Promise<RequestResult> {
    let result = new RequestResult();
    try {
      if (httpError.status || httpError.status == 0) {
        result.code = httpError.status;
        if (httpError.url.includes(Constants.cLOGIN_URL) || httpError.url.includes(Constants.cSSO_LOGIN_URL)) {
          result.code = httpError.error.errorCode;
        } else if (httpError.url.includes(Constants.cPOST_MESSAGE) && !httpError.url.includes(Constants.cANONYMOUS_POST_MESSAGE)) {
          if (httpError.status == 401) {
            result.code = await this.handleRefreshToken();
          } else {
            let object = { error: httpError, topic: topic };
            this.eventsService.reconnect.emit(object);
          }
        }
        else if(httpError.url.includes(Constants.cLOGOUT_URL)) {
          if (httpError.status == 401) {
            result.code = await this.handleRefreshToken();
          } else {
            this.eventsService.unAuthorized.emit(httpError);
          }
        }
        else if (httpError.url.includes(Constants.cREFRESH_TOKEN_URL)) {
          this.eventsService.unAuthorized.emit(httpError);
        }
      }
      else {
        result.code = LoginErrorCodes.Error;
      }
      return result;
    } catch (error) {
      this.logger.error(error);
      result.code = LoginErrorCodes.Error;
      return result;
    }
  }
}
