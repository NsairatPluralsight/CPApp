import { TestBed } from '@angular/core/testing';
import { MainLCDService } from './main-lcd.service';
import { CommunicationManagerService } from 'src/app/shared/services/communication-manager.service';
import { CommunicationService } from 'src/app/shared/services/communication.service';
import { LoggerService } from 'src/app/shared/services/logger.service';
import { Result, CountersOption } from 'src/app/shared/models/enum';
import { MainLCDConfiguration } from 'src/app/shared/models/main-lcd-configuration';
import { CVMComponent } from 'src/app/shared/models/cvm-component';
import { Counter } from 'src/app/shared/models/counter';
import { Service } from 'src/app/shared/models/service';
import { Branch } from 'src/app/shared/models/branch';

describe('MainLCDService', () => {
  let service: MainLCDService;
  let mockLoggerservice, mockCommunicationService;

  beforeEach(() => {
    mockLoggerservice = jasmine.createSpyObj(['error', 'info']);

    TestBed.configureTestingModule({
      providers: [MainLCDService,
        CommunicationManagerService,
        { provide: CommunicationService, useValue: mockCommunicationService},
        { provide: LoggerService, useValue: mockLoggerservice },
      ]
    });

    service = TestBed.get(MainLCDService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSettings', () => {

    it('should return Failed', async () => {
      let getComponentSpy = spyOn(CommunicationManagerService.prototype, 'getComponent').and.callFake(() => { return null});
      let getCountersSpy = spyOn(CommunicationManagerService.prototype, 'getCounters');
      let getServicesIDsSpy = spyOn(CommunicationManagerService.prototype, 'getServicesIDs');
      let getServicesSpy = spyOn(CommunicationManagerService.prototype, 'getServices');
      let prepareConfigurationSpy = spyOn(service, 'prepareConfiguration');

      let result = await service.getSettings(1);

      expect(result).toBe(Result.Failed);
      expect(getComponentSpy).toHaveBeenCalledTimes(1);
      expect(getCountersSpy).toHaveBeenCalledTimes(0);
      expect(getServicesIDsSpy).toHaveBeenCalledTimes(0);
      expect(getServicesSpy).toHaveBeenCalledTimes(0);
      expect(prepareConfigurationSpy).toHaveBeenCalledTimes(0);
    });

    it('should return Failed', async () => {
      let array = new Array<CVMComponent>();
      array.push(new CVMComponent());

      let getComponentSpy = spyOn(CommunicationManagerService.prototype, 'getComponent').and.callFake(() => { return array});
      let getCountersSpy = spyOn(CommunicationManagerService.prototype, 'getCounters').and.callFake(() => { return null});
      let getServicesIDsSpy = spyOn(CommunicationManagerService.prototype, 'getServicesIDs');
      let getServicesSpy = spyOn(CommunicationManagerService.prototype, 'getServices');
      let prepareConfigurationSpy = spyOn(service, 'prepareConfiguration');

      let result = await service.getSettings(1);

      expect(result).toBe(Result.Failed);
      expect(getComponentSpy).toHaveBeenCalledTimes(1);
      expect(getCountersSpy).toHaveBeenCalledTimes(1);
      expect(getServicesIDsSpy).toHaveBeenCalledTimes(0);
      expect(getServicesSpy).toHaveBeenCalledTimes(0);
      expect(prepareConfigurationSpy).toHaveBeenCalledTimes(0);
    });

    it('should return Failed', async () => {
      let array = new Array<CVMComponent>();
      array.push(new CVMComponent());
      let counters = new Array<Counter>();
      counters.push(new Counter(1, '2', 0, false, 'test', 'test', 'test', 'test'));

      let getComponentSpy = spyOn(CommunicationManagerService.prototype, 'getComponent').and.callFake(() => { return array});
      let getCountersSpy = spyOn(CommunicationManagerService.prototype, 'getCounters').and.callFake(() => { return counters});
      let getServicesIDsSpy = spyOn(CommunicationManagerService.prototype, 'getServicesIDs').and.callFake(() => { return null});
      let getServicesSpy = spyOn(CommunicationManagerService.prototype, 'getServices');
      let prepareConfigurationSpy = spyOn(service, 'prepareConfiguration');

      let result = await service.getSettings(1);

      expect(result).toBe(Result.Failed);
      expect(getComponentSpy).toHaveBeenCalledTimes(1);
      expect(getCountersSpy).toHaveBeenCalledTimes(1);
      expect(getServicesIDsSpy).toHaveBeenCalledTimes(1);
      expect(getServicesSpy).toHaveBeenCalledTimes(0);
      expect(prepareConfigurationSpy).toHaveBeenCalledTimes(0);
    });

    it('should return Failed', async () => {
      let array = new Array<CVMComponent>();
      array.push(new CVMComponent());
      let counters = new Array<Counter>();
      counters.push(new Counter(1, '2', 0, false, 'test', 'test', 'test', 'test'));

      let getComponentSpy = spyOn(CommunicationManagerService.prototype, 'getComponent').and.callFake(() => { return array});
      let getCountersSpy = spyOn(CommunicationManagerService.prototype, 'getCounters').and.callFake(() => { return counters});
      let getServicesIDsSpy = spyOn(CommunicationManagerService.prototype, 'getServicesIDs').and.callFake(() => { return [1,3,5]});
      let getServicesSpy = spyOn(CommunicationManagerService.prototype, 'getServices').and.callFake(() => { return null});
      let prepareConfigurationSpy = spyOn(service, 'prepareConfiguration');

      let result = await service.getSettings(1);

      expect(result).toBe(Result.Failed);
      expect(getComponentSpy).toHaveBeenCalledTimes(1);
      expect(getCountersSpy).toHaveBeenCalledTimes(1);
      expect(getServicesIDsSpy).toHaveBeenCalledTimes(1);
      expect(getServicesSpy).toHaveBeenCalledTimes(1);
      expect(prepareConfigurationSpy).toHaveBeenCalledTimes(0);
    });

    it('should return Failed', async () => {
      let array = new Array<CVMComponent>();
      array.push(new CVMComponent());
      let counters = new Array<Counter>();
      counters.push(new Counter(1, '2', 0, false, 'test', 'test', 'test', 'test'));

      let services = new Array<Service>();
      services.push(new Service(1, 'test', false));

      let getComponentSpy = spyOn(CommunicationManagerService.prototype, 'getComponent').and.callFake(() => { return array});
      let getCountersSpy = spyOn(CommunicationManagerService.prototype, 'getCounters').and.callFake(() => { return counters});
      let getServicesIDsSpy = spyOn(CommunicationManagerService.prototype, 'getServicesIDs').and.callFake(() => { return [1,3,5]});
      let getServicesSpy = spyOn(CommunicationManagerService.prototype, 'getServices').and.callFake(() => { return services});
      let prepareConfigurationSpy = spyOn(service, 'prepareConfiguration').and.callFake(() => { return Result.Failed});

      let result = await service.getSettings(1);

      expect(result).toBe(Result.Failed);
      expect(getComponentSpy).toHaveBeenCalledTimes(1);
      expect(getCountersSpy).toHaveBeenCalledTimes(1);
      expect(getServicesIDsSpy).toHaveBeenCalledTimes(1);
      expect(getServicesSpy).toHaveBeenCalledTimes(1);
      expect(prepareConfigurationSpy).toHaveBeenCalledTimes(1);
    });

    it('should return Success', async () => {
      let array = new Array<CVMComponent>();
      array.push(new CVMComponent());
      let counters = new Array<Counter>();
      counters.push(new Counter(1, '2', 0, false, 'test', 'test', 'test', 'test'));

      let services = new Array<Service>();
      services.push(new Service(1, 'test', false));

      let getComponentSpy = spyOn(CommunicationManagerService.prototype, 'getComponent').and.callFake(() => { return array});
      let getCountersSpy = spyOn(CommunicationManagerService.prototype, 'getCounters').and.callFake(() => { return counters});
      let getServicesIDsSpy = spyOn(CommunicationManagerService.prototype, 'getServicesIDs').and.callFake(() => { return [1,3,5]});
      let getServicesSpy = spyOn(CommunicationManagerService.prototype, 'getServices').and.callFake(() => { return services});
      let prepareConfigurationSpy = spyOn(service, 'prepareConfiguration').and.callFake(() => { return Result.Success});

      let result = await service.getSettings(1);

      expect(result).toBe(Result.Success);
      expect(getComponentSpy).toHaveBeenCalledTimes(1);
      expect(getCountersSpy).toHaveBeenCalledTimes(1);
      expect(getServicesIDsSpy).toHaveBeenCalledTimes(1);
      expect(getServicesSpy).toHaveBeenCalledTimes(1);
      expect(prepareConfigurationSpy).toHaveBeenCalledTimes(1);
    });

  });

  describe('setConfiguration', () => {
    it('should return success', async () => {
      let saveSettingsSpy = spyOn(CommunicationManagerService.prototype, 'saveSettings').and.callFake(() => { return Result.Success});

      let result = await service.setConfiguration(1, new MainLCDConfiguration(0, true, true, 5, 10, CountersOption.All));

      expect(result).toBe(Result.Success);
      expect(saveSettingsSpy).toHaveBeenCalledTimes(1);
    });
    it('should return failed', async () => {
      let saveSettingsSpy = spyOn(CommunicationManagerService.prototype, 'saveSettings').and.callFake(() => { return Result.Failed});

      let result = await service.setConfiguration(1, new MainLCDConfiguration(0, true, true, 5, 10, CountersOption.All));

      expect(result).toBe(Result.Failed);
      expect(saveSettingsSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('identify', () => {
    it('should return success', async () => {
      let executeCommandsSpy = spyOn(CommunicationManagerService.prototype, 'executeCommand').and.callFake(() => { return Result.Success});

      let result = await service.identify(1);

      expect(result).toBe(Result.Success);
      expect(executeCommandsSpy).toHaveBeenCalledTimes(1);
    });
    it('should return failed', async () => {
      let executeCommandsSpy = spyOn(CommunicationManagerService.prototype, 'executeCommand').and.callFake(() => { return Result.Failed});

      let result = await service.identify(1);

      expect(result).toBe(Result.Failed);
      expect(executeCommandsSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('prepareConfiguration', () => {

    it('should return default Configuration', async () => {
      service.mainLCD = new CVMComponent();

      let result = await service.prepareConfiguration();

      expect(result).toBe(Result.Success);
      expect(service.mainLCD.configuration).not.toBe(null);
    });

  });

  describe('filterConfiguration', () => {

    it('should return null',async () => {
      let result = await service.filterConfiguration(null);

      expect(result).toBe(null);
    });

    it('should return Configuration', async () => {
      let config = new MainLCDConfiguration(0, true, true, 5, 10, CountersOption.All);
      config.counters = new Array<Counter>();
      config.counters.push(new Counter(1, '2', 0, false, 'test', 'test', 'test', 'test'));
      config.services = new Array<Service>();
      config.services.push(new Service(1, 'test', true));

      let result = await service.filterConfiguration(config);

      expect(result).not.toBe(null);
      expect(typeof(result.services)).toBe('object');
    });
  });

  describe('setBranch', () => {
    it('should set branch', async () => {
      const branches = new Array<Branch>();
      branches.push(new Branch(1, 'B1'));
      const getBranchesSpy = spyOn(CommunicationManagerService.prototype, 'getBranches').and.callFake(() => { return branches});

      await service.setBranch(1);

      expect(service.branch.id).toEqual(1);
    });

    it('should branch be undefined', async () => {
      const branches = new Array<Branch>();
      branches.push(new Branch(1, 'B1'));
      const getBranchesSpy = spyOn(CommunicationManagerService.prototype, 'getBranches').and.callFake(() => { return branches});

      await service.setBranch(2);

      expect(service.branch).toBeUndefined();
    });
  });

});
