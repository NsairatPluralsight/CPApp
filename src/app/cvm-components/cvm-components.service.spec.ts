import { TestBed } from '@angular/core/testing';
import { CVMComponentsService } from './cvm-components.service';
import { CommunicationManagerService } from '../shared/services/communication-manager.service';
import { CommunicationService } from '../shared/services/communication.service';
import { LoggerService } from '../shared/services/logger.service';
import { Result } from '../shared/models/enum';
import { Branch } from '../shared/models/branch';
import { CVMComponentType } from '../shared/models/cvm-component-type';
import { CVMComponent } from '../shared/models/cvm-component';

describe('CVMComponentsService', () => {
  let service: CVMComponentsService;
  let mockLoggerservice;
  const mockCommunicationService = {};

  beforeEach(() => {
    mockLoggerservice = jasmine.createSpyObj(['error', 'info']);

    TestBed.configureTestingModule({
      providers: [CVMComponentsService,
        CommunicationManagerService,
        { provide: CommunicationService, useValue: mockCommunicationService},
        { provide: LoggerService, useValue: mockLoggerservice },
      ],
     });
    service = TestBed.get(CVMComponentsService);
    });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialize', () => {
    it('should return false', async () => {
      const getBranchesSpy = spyOn(CommunicationManagerService.prototype, 'getBranches').and.callFake(() => null);
      const getComponentTypesSpy  = spyOn(CommunicationManagerService.prototype, 'getComponentTypes');

      const result = await service.initialize();

      expect(result).toBe(Result.Failed);
      expect(getBranchesSpy).toHaveBeenCalledTimes(1);
      expect(getComponentTypesSpy).toHaveBeenCalledTimes(1);
    });

    it('should call getComponentTypes return false', async () => {
      const branches = new Array<Branch>();
      branches.push(new Branch(1, 'B1'));
      const getBranchesSpy = spyOn(CommunicationManagerService.prototype, 'getBranches').and.callFake(() => branches);
      const getComponentTypesSpy  = spyOn(CommunicationManagerService.prototype, 'getComponentTypes')
                                  .and.callFake(() => null);

      const result = await service.initialize();

      expect(result).toBe(Result.Failed);
      expect(getBranchesSpy).toHaveBeenCalledTimes(1);
      expect(getComponentTypesSpy).toHaveBeenCalledTimes(1);
    });

    it('should call getComponentTypes return false', async () => {
      const branches = new Array<Branch>();
      branches.push(new Branch(1, 'B1'));
      const types = new Array<CVMComponentType>();
      types.push(new CVMComponentType());
      const getBranchesSpy = spyOn(CommunicationManagerService.prototype, 'getBranches').and.callFake(() => branches);
      const getComponentTypesSpy  = spyOn(CommunicationManagerService.prototype, 'getComponentTypes')
                                  .and.callFake(() => types);
      const getCountSpy = spyOn(service, 'getCount').and.callFake(() => Result.Failed);

      const result = await service.initialize();

      expect(result).toBe(Result.Failed);
      expect(getBranchesSpy).toHaveBeenCalledTimes(1);
      expect(getComponentTypesSpy).toHaveBeenCalledTimes(1);
      expect(getCountSpy).toHaveBeenCalledTimes(1);
    });

    it('should call getComponentTypes return false', async () => {
      const branches = new Array<Branch>();
      branches.push(new Branch(1, 'B1'));
      const types = new Array<CVMComponentType>();
      types.push(new CVMComponentType());
      const getBranchesSpy = spyOn(CommunicationManagerService.prototype, 'getBranches').and.callFake(() => branches);
      const getComponentTypesSpy  = spyOn(CommunicationManagerService.prototype, 'getComponentTypes')
                                  .and.callFake(() => types);
      const getCountSpy = spyOn(service, 'getCount').and.callFake(() => Result.Success);

      const result = await service.initialize();

      expect(result).toBe(Result.Success);
      expect(getBranchesSpy).toHaveBeenCalledTimes(1);
      expect(getComponentTypesSpy).toHaveBeenCalledTimes(1);
      expect(getCountSpy).toHaveBeenCalledTimes(1);
    });

  });

  describe('getCount',  () => {
    it('should return Failed', async () => {
      const getComponentsCountSpy = spyOn(CommunicationManagerService.prototype, 'getComponentsCount').and.callFake(() => null);

      const result = await service.getCount(115);

      expect(result).toBe(Result.Failed);
      expect(getComponentsCountSpy).toHaveBeenCalledTimes(1);
    });

    it('should return Success', async () => {
      const getComponentsCountSpy = spyOn(CommunicationManagerService.prototype, 'getComponentsCount').and.callFake(() => 5);

      const result = await service.getCount(115);

      expect(result).toBe(Result.Success);
      expect(getComponentsCountSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDevices',  () => {
    it('should return null', async () => {
      const getComponentSpy = spyOn(CommunicationManagerService.prototype, 'getComponent').and.callFake(() => null);

      const result = await service.getDevices(1, 'ID', 115);

      expect(result).toBe(null);
      expect(getComponentSpy).toHaveBeenCalledTimes(1);
    });

    it('should return Success', async () => {
      const components = new Array<CVMComponent>();
      components.push(new CVMComponent());

      const getComponentSpy = spyOn(CommunicationManagerService.prototype, 'getComponent').and.callFake(() => components);

      const result = await service.getDevices(1, 'ID', 115);

      expect(result.length).toBe(1);
      expect(getComponentSpy).toHaveBeenCalledTimes(1);
    });
  });
});
