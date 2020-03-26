import { TestBed, fakeAsync } from '@angular/core/testing';
import { EventEmitter } from '@angular/core';
import { CommunicationService } from './communication.service';
import { RequestPayload } from '../models/payload';
import { EventsService } from './events.service';
import { LoggerService } from './logger.service';
import { CacheService } from './cache.service';
import { SessionStorageService } from './session-storage.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Constants } from '../models/constants';
import { Result } from '../models/enum';
import { reject } from 'q';
import { AuthenticatedUser, loginUserData, RefreshTokenData } from '../models/user';
import { ConnectivityService } from './connectivity.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

describe('CommunicationService', () => {
  let service: CommunicationService;
  let httpTestingController: HttpTestingController;
  let payload: RequestPayload;
  let mockLoggerservice;
  let mockConnectivityService = {

  }

  let mockEventsService = {
    unAuthenticated: new EventEmitter(),
    unAuthorized: new EventEmitter(),
    onDisconnect: new EventEmitter(),
    setUser: new EventEmitter()
  };

  mockEventsService.unAuthenticated = new EventEmitter();
  mockEventsService.unAuthorized = new EventEmitter();
  mockEventsService.onDisconnect = new EventEmitter();
  mockEventsService.setUser = new EventEmitter();

  beforeEach(() => {
    mockLoggerservice = jasmine.createSpyObj(['error', 'info']);

    TestBed.configureTestingModule({
      providers: [CommunicationService,
        { provide: EventsService, useValue: mockEventsService },
        { provide: LoggerService, useValue: mockLoggerservice },
        { provide: ConnectivityService, useValue: mockConnectivityService },
        SessionStorageService,
        CacheService
      ],
      imports: [HttpClientTestingModule]
    });


    httpTestingController = TestBed.get(HttpTestingController);
    service = TestBed.get(CommunicationService);
    payload = new RequestPayload();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('post', () => {

    it('it should call http post', fakeAsync(async () => {
      spyOn(CacheService.prototype, 'getUser').and.returnValue(new AuthenticatedUser());

      service.post(payload, 'test');

      let req = httpTestingController.expectOne(Constants.cPOST_MESSAGE, '');
      expect(req.request.method).toBe('POST');
    }));

  });


  describe('logout', () => {

    it('it should call http post', fakeAsync(async () => {
      spyOn(CacheService.prototype, 'getUser').and.returnValue(new AuthenticatedUser());     

      service.logout();
      let req = httpTestingController.expectOne(Constants.cLOGOUT_URL, '');
      expect(req.request.method).toBe('POST');
    }));
  });

  describe('anonymousPost', () => {
    it('it should call http post', fakeAsync(async () => {

      service.anonymousPost(payload, 'test');

      let req = httpTestingController.expectOne(Constants.cANONYMOUS_POST_MESSAGE, '');
      expect(req.request.method).toBe('POST');
    }));
  });

  describe('authenticate', () => {

    it('it should call http post', fakeAsync(async () => {
      let token = {
        refreshToken: 'refreshToken'
      };
      service.authenticate(Constants.cREFRESH_TOKEN_URL, token);

      let req = httpTestingController.expectOne(Constants.cREFRESH_TOKEN_URL, '');
      expect(req.request.method).toBe('POST');
    }));

  });

  describe('handleRefreshToken', () => {

    it('should call authenticate', () => {
      let authUser = new AuthenticatedUser()
      authUser.isSSO = true;
      spyOn(CacheService.prototype, 'getUser').and.returnValue(authUser);

      let spy = spyOn(service, 'authenticate');

      service.handleRefreshToken();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call refreshToken', () => {
      let authUser = new AuthenticatedUser();
      authUser.userId = 1;
      authUser.token = undefined;
      authUser.isSSO = false;
      authUser.username = "user";
      authUser.refreshTokenData = new RefreshTokenData("refreshToken", "token")
      spyOn(CacheService.prototype, 'getUser').and.returnValue(authUser);
      let spy = spyOn(service, 'refreshToken');

      service.handleRefreshToken();

      expect(spy).toHaveBeenCalledTimes(1);
    });

  });

  describe('refreshToken', () => {

    it('it should return failed and emit unAuthnticated', async () => {
      let closeSockeSpy = spyOn(service, 'closeSocketIO');
      let authenticateSpy = spyOn(service, 'authenticate').and.callFake(async () => { return reject({ code: 401 }) });
      let unAuthenticatedSpy = spyOn(mockEventsService.unAuthenticated, 'emit');

      let result = await service.refreshToken(new RefreshTokenData("refreshToken", "token"));

      expect(result).toBe(Result.Failed);
      expect(closeSockeSpy).toHaveBeenCalledTimes(1);
      expect(authenticateSpy).toHaveBeenCalledTimes(1);
      expect(unAuthenticatedSpy).toHaveBeenCalledTimes(1);
    });

    it('it should return Success and emit setUser', async () => {

      let initializeSockeSpy = spyOn(service, 'initializeSocketIO').and.callFake(() => { return; });
      let authenticateSpy = spyOn(service, 'authenticate').and.callFake(async () => { return { user: {}, token: 'token' } });
      let setUser = spyOn(mockEventsService.setUser, 'emit');
      let raiseUserTokenSpy = spyOn(SessionStorageService.prototype, 'raiseUserTokenRefreshed');

      let result = await service.refreshToken(new RefreshTokenData("refreshToken", "token"));

      expect(result).toBe(Result.Success);
      expect(initializeSockeSpy).toHaveBeenCalledTimes(1);
      expect(authenticateSpy).toHaveBeenCalledTimes(1);
      expect(setUser).toHaveBeenCalledTimes(1);
      expect(raiseUserTokenSpy).toHaveBeenCalledTimes(1);
    });

  });

  describe('getFile', () => {

    it('it should call http GET', fakeAsync(async () => {

      service.getFile('test');

      let req = httpTestingController.expectOne('test', '');
      expect(req.request.method).toBe('GET');
    }));

  });
});
