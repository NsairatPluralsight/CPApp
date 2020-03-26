import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from './authentication.service';
import { LoggerService } from './logger.service';
import { CacheService } from './cache.service';
import { CommunicationService } from './communication.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoginErrorCodes } from '../models/enum';
import { AuthenticatedUser } from '../models/user';
import { reject } from 'q';
import { StateService } from './state.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let mockLoggerservice;
  let mockStateService;

  beforeEach(() => {
    mockLoggerservice = jasmine.createSpyObj(['error', 'info']);

    TestBed.configureTestingModule({
      providers: [
        AuthenticationService,
        { provide: LoggerService, useValue: mockLoggerservice },
        { provide: StateService, useValue: mockStateService },
        CommunicationService,
        CacheService,
      ],
      imports: [HttpClientTestingModule]
    });

    service = TestBed.get(AuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('SSOLogin', () => {
    it('should return error', async () => {
      spyOn(CommunicationService.prototype, 'authenticate').and.callFake(async () => {
        return reject({ status: 401, code: LoginErrorCodes.InvalidUsername })
      });

      let result = await service.SSOLogin();

      expect(result).toBe(LoginErrorCodes.InvalidUsername);
    });

    it('should return success', async () => {
      spyOn(CommunicationService.prototype, 'authenticate').and.callFake(async () => {
        return { user: {}, token: 'test' }
      });
      let spy = spyOn(service, 'setUser');

      let result = await service.SSOLogin();

      expect(result).toBe(LoginErrorCodes.Success);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return error', async () => {
      spyOn(CommunicationService.prototype, 'authenticate').and.callFake(async () => {
        return reject({ status: 401, code: LoginErrorCodes.InvalidUsername })
      });

      let result = await service.login('nsairat', '123456');

      expect(result).toBe(LoginErrorCodes.InvalidUsername);
    });

    it('should return success', async () => {
      spyOn(CommunicationService.prototype, 'authenticate').and.callFake(async () => {
        return { user: {},  token: 'test' }
      });
      let spy = spyOn(service, 'setUser');

      let result = await service.login('nsairat', '123456');

      expect(result).toBe(LoginErrorCodes.Success);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should call two methods', () => {
      let setUserSpy = spyOn(CacheService.prototype, 'setUser');
      let socketIOSpy = spyOn(CommunicationService.prototype, 'initializeSocketIO');

      service.setUser(new AuthenticatedUser());

      expect(setUserSpy).toHaveBeenCalledTimes(1);
      expect(socketIOSpy).toHaveBeenCalledTimes(1);
    });
  });
});
