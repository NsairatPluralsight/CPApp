import { TestBed } from '@angular/core/testing';
import { CommonActionsService } from './common-actions.service';
import { LoggerService } from './logger.service';
import { LoginErrorCodes, PermissionType } from '../models/enum';
import { Constants } from '../models/constants';
import { MultilingualService } from './multilingual.service';
import { CommunicationManagerService } from './communication-manager.service';
import { CacheService } from './cache.service';
import { CommunicationService } from './communication.service';
import { Permission } from '../models/permission';
import { Branch } from '../models/branch';

describe('CommonActionsService', () => {
  let service: CommonActionsService;
  let mockLoggerservice;
  let mockMultilingualService;
  const mockCommunicationService = undefined;

  mockMultilingualService = {
    getCaption(key) {
      return key + `_${Constants.cCAPTION}`;
    },
  };

  beforeEach(() => {
    mockLoggerservice = jasmine.createSpyObj(['error', 'info']);

    TestBed.configureTestingModule({
      providers: [
        CommonActionsService,
        CommunicationManagerService,
        CacheService,
        { provide: LoggerService, useValue: mockLoggerservice },
        { provide: MultilingualService, useValue: mockMultilingualService },
        { provide: CommunicationService, useValue: mockCommunicationService},
      ],
    });

    service = TestBed.get(CommonActionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getErrorCaption', () => {
    it('should return INVALID_LOGIN_DATA error', () => {
      const caption = service.getErrorCaption(LoginErrorCodes.InvalidPassword);

      expect(caption).toBe(Constants.cERROR_INVALID_LOGIN_DATA + `_${Constants.cCAPTION}`);
    });

    it('should return general error', () => {
      const caption = service.getErrorCaption(55);

      expect(caption).toBe(Constants.cERROR_GENERAL + `_${Constants.cCAPTION}`);
    });
  });

  describe('checkUserPermission', () => {
    it('should return false', async () => {
      const getUserPermissionSpy = spyOn(CommunicationManagerService.prototype, 'getUserPermission').and.callFake(() => {
        return null;
      });
      const setPermissionSpy = spyOn(CacheService.prototype, 'setPermission');

      const permition = await service.checkUserPermission();

      expect(permition).toBe(false);
      expect(getUserPermissionSpy).toHaveBeenCalledTimes(1);
      expect(setPermissionSpy).toHaveBeenCalledTimes(0);
    });

    it('should return true', async () => {
      const getUserPermissionSpy = spyOn(CommunicationManagerService.prototype, 'getUserPermission').and.callFake(() => {
        return new Permission(true, true, true, true, true);
      });
      const setPermissionSpy = spyOn(CacheService.prototype, 'setPermission');

      const permition = await service.checkUserPermission();

      expect(permition).toBe(true);
      expect(getUserPermissionSpy).toHaveBeenCalledTimes(1);
      expect(setPermissionSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkPermission', () => {
    it('should return false', async () => {
      const getPermissionSpy = spyOn(CacheService.prototype, 'getPermission').and.callFake(() => {
        return null;
      });

      const permition = await service.checkPermission(PermissionType.Create);

      expect(permition).toBe(false);
      expect(getPermissionSpy).toHaveBeenCalledTimes(1);
    });

    it('should return true', async () => {
      const getPermissionSpy = spyOn(CacheService.prototype, 'getPermission').and.callFake(() => {
        return new Permission(true, true, true, true, true);
      });

      const permition = await service.checkPermission(PermissionType.Create);

      expect(permition).toBe(true);
      expect(getPermissionSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getBranch', () => {
    it('should return branch', async () => {
      const getBranchesSpy = spyOn(CacheService.prototype, 'getBranches').and.callFake(() => {
        const branches = new Array<Branch>();
        branches.push(new Branch(1, 'test'));
        return branches;
      });

      const branch = await service.getBranch(1);

      expect(branch.id).toBe(1);
      expect(getBranchesSpy).toHaveBeenCalledTimes(1);
    });

    it('should return undefined', async () => {
      const getBranchesSpy = spyOn(CacheService.prototype, 'getBranches').and.callFake(() => {
        return  new Array<Branch>();
      });

      const branch = await service.getBranch(15);

      expect(branch).toBe(undefined);
      expect(getBranchesSpy).toHaveBeenCalledTimes(1);
    });
  });

});
