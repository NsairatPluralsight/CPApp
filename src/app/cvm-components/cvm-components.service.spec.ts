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
  let mockLoggerservice, mockCommunicationService;

  beforeEach(() =>{
    mockLoggerservice = jasmine.createSpyObj(['error', 'info']);

     TestBed.configureTestingModule({
      providers: [CVMComponentsService,
        CommunicationManagerService,
        { provide: CommunicationService, useValue: mockCommunicationService},
        { provide: LoggerService, useValue: mockLoggerservice },
      ]
     });

     service = TestBed.get(CVMComponentsService);
    });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialize', () => {

    it('should return false', async () => {
      let getBranchesSpy = spyOn(CommunicationManagerService.prototype, 'getBranches').and.callFake(() => { return null});
      let getComponentTypesSpy  = spyOn(CommunicationManagerService.prototype, 'getComponentTypes');

      let result = await service.initialize();

      expect(result).toBe(Result.Failed);
      expect(getBranchesSpy).toHaveBeenCalledTimes(1);
      expect(getComponentTypesSpy).toHaveBeenCalledTimes(1);
    });

    it('should call getComponentTypes return false', async () => {
      let branches = new Array<Branch>();
      branches.push(new Branch(1, 'B1'));

      let getBranchesSpy = spyOn(CommunicationManagerService.prototype, 'getBranches').and.callFake(() => { return branches});
      let getComponentTypesSpy  = spyOn(CommunicationManagerService.prototype, 'getComponentTypes')
                                  .and.callFake(() => { return null});

      let result = await service.initialize();

      expect(result).toBe(Result.Failed);
      expect(getBranchesSpy).toHaveBeenCalledTimes(1);
      expect(getComponentTypesSpy).toHaveBeenCalledTimes(1);
    });

    it('should call getComponentTypes return false', async () => {
      let branches = new Array<Branch>();
      branches.push(new Branch(1, 'B1'));

      let types = new Array<CVMComponentType>();
      types.push(new CVMComponentType());

      let getBranchesSpy = spyOn(CommunicationManagerService.prototype, 'getBranches').and.callFake(() => { return branches});
      let getComponentTypesSpy  = spyOn(CommunicationManagerService.prototype, 'getComponentTypes')
                                  .and.callFake(() => { return types});
      let getCountSpy = spyOn(service, 'getCount').and.callFake(() => { return Result.Failed});

      let result = await service.initialize();

      expect(result).toBe(Result.Failed);
      expect(getBranchesSpy).toHaveBeenCalledTimes(1);
      expect(getComponentTypesSpy).toHaveBeenCalledTimes(1);
      expect(getCountSpy).toHaveBeenCalledTimes(1);
    });

    it('should call getComponentTypes return false', async () => {
      let branches = new Array<Branch>();
      branches.push(new Branch(1, 'B1'));

      let types = new Array<CVMComponentType>();
      types.push(new CVMComponentType());

      let getBranchesSpy = spyOn(CommunicationManagerService.prototype, 'getBranches').and.callFake(() => { return branches});
      let getComponentTypesSpy  = spyOn(CommunicationManagerService.prototype, 'getComponentTypes')
                                  .and.callFake(() => { return types});
      let getCountSpy = spyOn(service, 'getCount').and.callFake(() => { return Result.Success});

      let result = await service.initialize();

      expect(result).toBe(Result.Success);
      expect(getBranchesSpy).toHaveBeenCalledTimes(1);
      expect(getComponentTypesSpy).toHaveBeenCalledTimes(1);
      expect(getCountSpy).toHaveBeenCalledTimes(1);
    });

  });

  describe('getCount',  () => {

    it('should return Failed', async () => {
      let getComponentsCountSpy = spyOn(CommunicationManagerService.prototype, 'getComponentsCount').and.callFake(() => { return null});

      let result = await service.getCount(115);

      expect(result).toBe(Result.Failed);
      expect(getComponentsCountSpy).toHaveBeenCalledTimes(1);
    });

    it('should return Success', async () => {
      let getComponentsCountSpy = spyOn(CommunicationManagerService.prototype, 'getComponentsCount').and.callFake(() => { return 5});

      let result = await service.getCount(115);

      expect(result).toBe(Result.Success);
      expect(getComponentsCountSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDevices',  () => {

    it('should return null', async () => {
      let getComponentSpy = spyOn(CommunicationManagerService.prototype, 'getComponent').and.callFake(() => { return null});

      let result = await service.getDevices(1, 'ID', 115);

      expect(result).toBe(null);
      expect(getComponentSpy).toHaveBeenCalledTimes(1);
    });

    it('should return Success', async () => {
      let components = new Array<CVMComponent>();
      components.push(new CVMComponent());

      let getComponentSpy = spyOn(CommunicationManagerService.prototype, 'getComponent').and.callFake(() => { return components});

      let result = await service.getDevices(1, 'ID', 115);

      expect(result.length).toBe(1);
      expect(getComponentSpy).toHaveBeenCalledTimes(1);
    });
  });
});
