import { TestBed } from '@angular/core/testing';
import { CounterLCDService } from './counter-lcd.service';
import { LoggerService } from '../shared/services/logger.service';
import { CommunicationManagerService } from '../shared/services/communication-manager.service';
import { CommunicationService } from '../shared/services/communication.service';
import { Result } from '../shared/models/enum';
import { CVMComponent } from '../shared/models/cvm-component';
import { Counter } from '../shared/models/counter';
import { CounterLCDConfiguration } from '../shared/models/counter-lcd-configuration';

describe('CounterLCDService', () => {
  let service: CounterLCDService;
  let mockLoggerservice;
  const mockCommunicationService = {};

  beforeEach(() => {
    mockLoggerservice = jasmine.createSpyObj(['error', 'info']);

    TestBed.configureTestingModule({
      providers: [CounterLCDService,
        CommunicationManagerService,
        { provide: CommunicationService, useValue: mockCommunicationService},
        { provide: LoggerService, useValue: mockLoggerservice },
      ],
    });

    service = TestBed.get(CounterLCDService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSettings', () => {
    it('should return Failed', async () => {
      const getComponentSpy = spyOn(CommunicationManagerService.prototype, 'getComponent').and.callFake(() => null);
      const getCountersSpy  = spyOn(CommunicationManagerService.prototype, 'getCounters');

      const result = await service.getSettings(1);

      expect(result).toBe(Result.Failed);
      expect(getComponentSpy).toHaveBeenCalledTimes(1);
      expect(getCountersSpy).toHaveBeenCalledTimes(0);
    });

    it('should call getCounters and return Failed', async () => {
      const array = new Array<CVMComponent>();
      array.push(new CVMComponent());

      const getComponentSpy = spyOn(CommunicationManagerService.prototype, 'getComponent')
                            .and.callFake(() => array);
      const getCountersSpy  = spyOn(CommunicationManagerService.prototype, 'getCounters')
                            .and.callFake(() => null);

      const result = await service.getSettings(1);

      expect(result).toBe(Result.Failed);
      expect(getComponentSpy).toHaveBeenCalledTimes(1);
      expect(getCountersSpy).toHaveBeenCalledTimes(1);
    });

    it('should call prepareConfiguration and return Failed', async () => {
      const componentsArray = new Array<CVMComponent>();
      componentsArray.push(new CVMComponent());

      const countersArray = new Array<Counter>();
      countersArray.push(new Counter(1, '2', 0, false, 'test', 'test', 'test', 'test'));

      const getComponentSpy = spyOn(CommunicationManagerService.prototype, 'getComponent')
                            .and.callFake(() => componentsArray);
      const getCountersSpy  = spyOn(CommunicationManagerService.prototype, 'getCounters')
                            .and.callFake(() => countersArray);

      const prepareConfigurationSpy = spyOn(service, 'prepareConfiguration').and.callFake(() => Result.Failed);

      const result = await service.getSettings(1);

      expect(result).toBe(Result.Failed);
      expect(getComponentSpy).toHaveBeenCalledTimes(1);
      expect(getCountersSpy).toHaveBeenCalledTimes(1);
      expect(prepareConfigurationSpy).toHaveBeenCalledTimes(1);
    });

    it('should return Success', async () => {
      const componentsArray = new Array<CVMComponent>();
      componentsArray.push(new CVMComponent());

      const countersArray = new Array<Counter>();
      countersArray.push(new Counter(1, '2', 0, false, 'test', 'test', 'test', 'test'));

      const getComponentSpy = spyOn(CommunicationManagerService.prototype, 'getComponent')
                            .and.callFake(() => componentsArray);
      const getCountersSpy  = spyOn(CommunicationManagerService.prototype, 'getCounters')
                            .and.callFake(() => countersArray);

      const prepareConfigurationSpy = spyOn(service, 'prepareConfiguration').and.callFake(() => Result.Success);

      const result = await service.getSettings(1);

      expect(result).toBe(Result.Success);
      expect(getComponentSpy).toHaveBeenCalledTimes(1);
      expect(getCountersSpy).toHaveBeenCalledTimes(1);
      expect(prepareConfigurationSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('prepareConfiguration', () => {
    it('should return Success and return new configuration', async () => {
      service.counterLCD = new CVMComponent();

      const result = await service.prepareConfiguration();

      expect(result).toBe(Result.Success);
      expect(service.counterLCDConfiguration.counterID).toBe(0);
    });

    it('should return Success and return the predefined Configuration', async () => {
      service.counterLCD = new CVMComponent();
      service.counterLCD.configuration = new CounterLCDConfiguration(2);

      const result = await service.prepareConfiguration();

      expect(result).toBe(Result.Success);
      expect(service.counterLCDConfiguration.counterID).toBe(2);
    });
  });

  describe('setConfiguration', () => {
    it('should return success', async () => {
      const saveSettingsSpy = spyOn(CommunicationManagerService.prototype, 'saveSettings').and.callFake(() => Result.Success);

      const result = await service.setConfiguration(1, new CounterLCDConfiguration(0));

      expect(result).toBe(Result.Success);
      expect(saveSettingsSpy).toHaveBeenCalledTimes(1);
    });
    it('should return failed', async () => {
      const saveSettingsSpy = spyOn(CommunicationManagerService.prototype, 'saveSettings').and.callFake(() => Result.Failed);

      const result = await service.setConfiguration(1, new CounterLCDConfiguration(0));

      expect(result).toBe(Result.Failed);
      expect(saveSettingsSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('identify', () => {
    it('should return success', async () => {
      const executeCommandsSpy = spyOn(CommunicationManagerService.prototype, 'executeCommand').and.callFake(() => Result.Success);

      const result = await service.identify(1);

      expect(result).toBe(Result.Success);
      expect(executeCommandsSpy).toHaveBeenCalledTimes(1);
    });
    it('should return failed', async () => {
      const executeCommandsSpy = spyOn(CommunicationManagerService.prototype, 'executeCommand').and.callFake(() => Result.Failed);

      const result = await service.identify(1);

      expect(result).toBe(Result.Failed);
      expect(executeCommandsSpy).toHaveBeenCalledTimes(1);
    });
  });
});
