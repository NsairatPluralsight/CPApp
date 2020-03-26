import { TestBed } from '@angular/core/testing';
import { DefenderGuard } from './defender.guard';
import { CacheService } from '../shared/services/cache.service';
import { LoggerService } from '../shared/services/logger.service';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { AuthenticationService } from '../shared/services/authentication.service';
import { Router } from '@angular/router';
import { AuthenticatedUser } from '../shared/models/user';
import { CommunicationService } from '../shared/services/communication.service';
import { Result } from '../shared/models/enum';
import { CommonActionsService } from '../shared/services/common-actions.service';
import { MultilingualService } from '../shared/services/multilingual.service';
import { CommunicationManagerService } from '../shared/services/communication-manager.service';

describe('DefenderGuard', () => {
  let guard: DefenderGuard;
  let mockLoggerservice, mockSessionStorageService, mockCommService, mockMultilingualService, mockCommunicationManagerService;
  mockCommService = {
    authenticate() { }
  };

  let mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

  beforeEach(() => {
    mockLoggerservice = jasmine.createSpyObj(['error', 'info']);
    mockSessionStorageService = jasmine.createSpyObj(['getDataFromOtherTabs']);

    TestBed.configureTestingModule({
      providers: [DefenderGuard,
        CacheService,
        AuthenticationService,
        { provide: CommunicationManagerService, useValue: mockCommunicationManagerService },
        { provide: MultilingualService, useValue: mockMultilingualService },
        { provide: CommunicationService, useValue: mockCommService },
        { provide: SessionStorageService, useValue: mockSessionStorageService },
        { provide: LoggerService, useValue: mockLoggerservice },
        { provide: Router, useValue: mockRouter }
      ]
    });

    guard = TestBed.get(DefenderGuard);
  });

  it('should create', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    let next;
    beforeEach(() => {
      next = {
        routeConfig:  {
          path: ''
        }
      };

      mockRouter.navigate.calls.reset();
    });

    it('should return true', async () => {
      let startLoadingTimerSpy = spyOn(guard, 'startLoadingTimer');
      let authServiceSpy = spyOn(AuthenticationService.prototype, 'SSOLogin');
      spyOn(CacheService.prototype, 'getUser').and.callFake(() => { return new AuthenticatedUser() });

      let result = await guard.canActivate(next, null);

      expect(result).toBe(true);
      expect(startLoadingTimerSpy).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(0);
      expect(authServiceSpy).toHaveBeenCalledTimes(0);
    });

    it('should call navigate and return true', async () => {
      let startLoadingTimerSpy = spyOn(guard, 'startLoadingTimer');
      spyOn(CacheService.prototype, 'getUser').and.callFake(() => { return new AuthenticatedUser() });

      next.routeConfig.path = 'signin';
      let result = await guard.canActivate(next, null);

      expect(result).toBe(true);
      expect(startLoadingTimerSpy).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    });

    it('should call navigate and return false', async () => {
      let startLoadingTimerSpy = spyOn(guard, 'startLoadingTimer');
      spyOn(CacheService.prototype, 'getUser').and.callFake(() => { return null });

      let result = await guard.canActivate(next, null);

      expect(result).toBe(false);
      expect(startLoadingTimerSpy).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    });
  });
});
