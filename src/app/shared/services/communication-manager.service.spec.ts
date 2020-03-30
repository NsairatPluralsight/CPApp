import { TestBed, inject } from '@angular/core/testing';
import { CommunicationManagerService } from './communication-manager.service';
import { EventEmitter } from '@angular/core';
import { Message } from '../models/message';
import { CVMComponentType } from '../models/cvm-component-type';
import { CounterLCDConfiguration } from '../models/counter-lcd-configuration';
import { Branch } from '../models/branch';
import { EventsService } from './events.service';
import { LoggerService } from './logger.service';
import { CommunicationService } from './communication.service';
import { CacheService } from './cache.service';
import { Result } from '../models/enum';
import { AuthenticatedUser } from '../models/authenticated-User';
import { RefreshTokenData } from '../models/refresh-token-data';

describe('CommunicationManagerService', () => {
  let service: CommunicationManagerService;
  let mockLoggerservice;
  let mockCacheService;

  const mockEventsService = {
    unAuthorized: new EventEmitter(),
    unAuthorizedAction: new EventEmitter(),
  };
  mockEventsService.unAuthorized = new EventEmitter();
  mockEventsService.unAuthorizedAction = new EventEmitter();

  const config = {
    IPAddress: '10.0.0.24',
    allServicesSelected: true,
    counters: [
      {
        assigned: true,
        direction: 1,
        hall_ID: 117,
        id: 118,
        name_L1: 'C1',
        name_L2: 'C1',
        name_L3: '',
        name_L4: '',
        number: 1,
        queueBranch_ID: 115,
      }, {
        assigned: true,
        direction: 1,
        hall_ID: 117,
        id: 131,
        name_L1: 'C2',
        name_L2: 'C2',
        name_L3: '',
        name_L4: '',
        number: 2,
        queueBranch_ID: 115,
      },
      {
        assigned: true,
        direction: 2,
        hall_ID: 144,
        id: 145,
        name_L1: 'B2 C1',
        name_L2: '?2 ?1',
        name_L3: '',
        name_L4: '',
        number: 1,
        queueBranch_ID: 142,
      }],
    countersOption: 1,
    description: '15tlc',
    enable: true,
    enablePaging: true,
    identifier: 170,
    identity: 163,
    idleTimeForPaging: 50,
    pageDuration: 60,
    services: [],
    withWaiting: false,
  };
  const mainLCD = [{
    queueBranch_ID: 115,
    configuration: JSON.stringify(config),
    id: 1,
    name_L1: 'P15',
    name_L2: '?15',
    name_L3: '',
    name_L4: '',
    orgID: 1,
    relatedClass: 'Player',
    relatedObjectID: 170,
    report: '[]',
    type: 2,
  }];

  const jsonMainLCD = JSON.stringify(mainLCD);

  const mockCommService = {
    async post(payload: any, topicName: string) {
      const reqMessage = new Message();
      reqMessage.time = Date.now();
      reqMessage.topicName = topicName;
      reqMessage.payload = payload;

      const topicArray = topicName.split('/');

      if (topicArray[0] === 'ComponentService') {
        let payloadData: any;
        switch (topicArray[1]) {
          case 'Manager.GetComponent':
            reqMessage.payload = {
              data: jsonMainLCD,
              result: 0,
            };
            break;
          case 'Manager.GetComponentsCount':
            payloadData = JSON.stringify([{ Count: 5 }]);
            reqMessage.payload = {
              data: payloadData,
              result: 0,
            };
            break;
          case 'Manager.GetComponentType':
            const array = new Array<CVMComponentType>();
            array.push(new CVMComponentType());
            payloadData = JSON.stringify(array);

            reqMessage.payload = {
              data: payloadData,
              result: 0,
            };
            break;
          case 'Configuration.GetConfig':
            const tConfig = new CounterLCDConfiguration(1);
            const data = [{ Configuration: JSON.stringify(tConfig) }];
            payloadData = JSON.stringify(data);

            reqMessage.payload = {
              data: payloadData,
              result: 0,
            };
            break;
          case 'Manager.ExecuteCommand':
          case 'Configuration.SetConfig':
            reqMessage.payload = {
              result: 0,
            };
            break;
        }
      } else {
        switch (topicArray[1]) {
          case 'getBranches':
            const branches = new Array<Branch>();
            branches.push(new Branch(1, 'B1'));
            branches.push(new Branch(2, 'B2'));
            reqMessage.payload = {
              data: [branches],
              result: 0,
            };
            break;
          case 'getCounters':
            const counters = [
              { id: 120, Name_L1: 'Counter 1', Name_L2: 'النافذة 1', Name_L3: 'Counter 1', Name_L4: '', Number: 0 },
              { id: 121, Name_L1: 'Counter 2', Name_L2: 'النافذة 2', Name_L3: 'Counter 2', Name_L4: '', Number: 0 },
              { id: 605, Name_L1: 'Counter 5', Name_L2: 'Counter 5', Name_L3: 'Counter 5', Name_L4: '', Number: 0 },
              { id: 606, Name_L1: 'Counter 6', Name_L2: 'Counter 6', Name_L3: 'Counter 6', Name_L4: '', Number: 0 },
              { id: 607, Name_L1: 'Counter 7', Name_L2: 'Counter 7', Name_L3: 'Counter 7', Name_L4: '', Number: 0 },
            ];
            reqMessage.payload = {
              data: [counters],
              result: 0,
            };
            break;
          case 'getServices':
            const services = [
              { id: 113, Name_L1: 'Service 1', Name_L2: 'خدمة 1', Name_L3: 'Service 1', Name_L4: '' },
              { id: 114, Name_L1: 'Service 2', Name_L2: 'خدمة 2', Name_L3: 'Service 2', Name_L4: '' },
              { id: 159, Name_L1: 'Service 3', Name_L2: 'الخدمة 3', Name_L3: 'Service 3', Name_L4: '' },
              { id: 364, Name_L1: 'Service4', Name_L2: 'Service4', Name_L3: 'Service4', Name_L4: '' },
              { id: 366, Name_L1: 'Clearing Cheque', Name_L2: 'شيكات مقاصة', Name_L3: '', Name_L4: 'Clearing Cheque' },
              { id: 368, Name_L1: 'Bill Payment', Name_L2: 'دفع فواتير', Name_L3: 'Bill Payment', Name_L4: '' },
            ];
            reqMessage.payload = {
              data: [services],
              result: 0,
            };
            break;
        }
      }
      return reqMessage;
    },
    async anonymousPost(payload: any, topicName: string) {
      const reqMessage = new Message();
      reqMessage.time = Date.now();
      reqMessage.topicName = topicName;
      reqMessage.payload = payload;

      const languages = [{
        orgId: 1,
        languages: [
          { id: 1, caption: 'English', index: 1, prefix: 'en-US', rtl: 0 },
          { id: 2, caption: 'عربي', index: 2, prefix: 'ar-SA', rtl: 1 },
        ],
      }];
      reqMessage.payload = {
        data: [languages],
        result: 0,
      };

      return reqMessage;
    },
    // tslint:disable-next-line: no-empty
    getFile() {},
  };

  mockCacheService = {
    getCurrentLanguage() {
      const tLanguage = {
        id: 1,
        caption: 'ENGLISH',
        index: 2,
        prefix: 'EN',
        rtl: 0,
      };
      return tLanguage;
    },
    getUser() {
      const authUser = new AuthenticatedUser();
      authUser.userId = 1;
      authUser.username = 'Nsairat';
      authUser.refreshTokenData = new RefreshTokenData('refreshToken', 'token');
      authUser.token = 'test';
      return authUser;
    },
    getBranches() {
      return new Array<Branch>();
    },
    setBranches(pBranches) {
      const branches = pBranches;
    },
  };

  beforeEach(() => {
    mockLoggerservice = jasmine.createSpyObj(['error', 'info']);

    TestBed.configureTestingModule({
      providers: [CommunicationManagerService,
        { provide: EventsService, useValue: mockEventsService },
        { provide: LoggerService, useValue: mockLoggerservice },
        { provide: CommunicationService, useValue: mockCommService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    });

    service = TestBed.get(CommunicationManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBranches', () => {

    it('should return two Branches', async () => {
      const result = await service.getBranches();

      expect(result.length).toBe(2);
    });

    it('should return null', inject([CacheService], async (cache: CacheService) => {
      spyOn(cache, 'getCurrentLanguage').and.callFake(() => null);

      const result = await service.getBranches();

      expect(result).toBe(null);
    }));

    it('should emit unAuthorizedAction', inject([CommunicationService], async (communication: CommunicationService) => {
      const reqMessage = new Message();
      reqMessage.time = Date.now();
      reqMessage.payload = {
        data: null,
        result: -3,
      };
      spyOn(communication, 'post').and.callFake(async () => reqMessage);
      const spy = spyOn(mockEventsService.unAuthorizedAction, 'emit');

      const result = await service.getBranches();

      expect(result).toBe(null);
      expect(spy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('getComponent', () => {
    it('should return Component', async () => {
      const result = await service.getComponent(115);

      expect(result.length).toBe(1);
    });

    it('should return null', inject([CommunicationService], async (communication: CommunicationService) => {
      spyOn(communication, 'post').and.callFake(async () => null);

      const result = await service.getComponent(115);

      expect(result).toBe(null);
    }));
  });

  describe('getComponentsCount', () => {
    it('should return Components count', async () => {
      const result = await service.getComponentsCount(115);

      expect(result).toBe(5);
    });

    it('should return null', inject([CommunicationService], async (communication: CommunicationService) => {
      spyOn(communication, 'post').and.callFake(async () => null);

      const result = await service.getComponentsCount(115);

      expect(result).toBe(null);
    }));
  });

  describe('getComponentTypes', () => {
    it('should return Component Types', async () => {
      const result = await service.getComponentTypes();

      expect(result.length).toBe(1);
    });

    it('should return null', inject([CommunicationService], async (communication: CommunicationService) => {
      spyOn(communication, 'post').and.callFake(async () => null);

      const result = await service.getComponentTypes();

      expect(result).toBe(null);
    }));
  });

  describe('getCounters', () => {
    it('should return Counters', async () => {
      const result = await service.getCounters(115);

      expect(result.length).toBe(5);
    });

    it('should return null', async () => {
      const result = await service.getCounters(null);

      expect(result).toBe(null);
    });

    it('should emit unAuthorizedAction', inject([CommunicationService], async (communication: CommunicationService) => {
      const reqMessage = new Message();
      reqMessage.time = Date.now();
      reqMessage.payload = {
        data: null,
        result: -3,
      };
      spyOn(communication, 'post').and.callFake(async () => reqMessage);
      const spy = spyOn(mockEventsService.unAuthorizedAction, 'emit');

      const result = await service.getCounters(115);

      expect(result).toBe(null);
      expect(spy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('getServices', () => {
    it('should return services', async () => {
      const result = await service.getServices([1, 2, 3]);

      expect(result.length).toBe(6);
    });

    it('should return null', inject([CacheService], async (cache: CacheService) => {
      spyOn(cache, 'getCurrentLanguage').and.callFake(() => null);

      const result = await service.getServices([1, 2, 3]);

      expect(result).toBe(null);
    }));

    it('should emit unAuthorizedAction', inject([CommunicationService], async (communication: CommunicationService) => {
      const reqMessage = new Message();
      reqMessage.time = Date.now();
      reqMessage.payload = {
        data: null,
        result: -3,
      };
      spyOn(communication, 'post').and.callFake(async () => reqMessage);
      const spy = spyOn(mockEventsService.unAuthorizedAction, 'emit');

      const result = await service.getServices([1, 2, 3]);

      expect(result).toBe(null);
      expect(spy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('saveSettings', () => {
    it('should return Success', async () => {
      const counterConfig = new CounterLCDConfiguration(1);

      const result = await service.saveSettings(1, 'CounterLCD', JSON.stringify(counterConfig));

      expect(result).toBe(Result.Success);
    });

    it('should return Failed', inject([CommunicationService], async (communication: CommunicationService) => {
      const reqMessage = new Message();
      reqMessage.time = Date.now();
      reqMessage.payload = {
        data: null,
        result: -3,
      };
      spyOn(communication, 'post').and.callFake(async () => reqMessage);

      const result = await service.saveSettings(1, 'CounterLCD', JSON.stringify(new CounterLCDConfiguration(1)));

      expect(result).toBe(Result.Failed);
    }));
  });

  describe('loadLanguages', () => {
    it('should return loadLanguages', async () => {
      const result = await service.loadLanguages();

      expect(result.length).toBe(2);
    });

    it('should return null', inject([CommunicationService], async (communication: CommunicationService) => {
      spyOn(communication, 'anonymousPost').and.callFake(async () => null);

      const result = await service.loadLanguages();

      expect(result).toBe(null);
    }));
  });

  describe('executeCommand', () => {
    it('should return Success', async () => {
      const result = await service.executeCommand(1, 'CounterLCD', 'hello');

      expect(result).toBe(Result.Success);
    });

    it('should return Failed', inject([CommunicationService], async (communication: CommunicationService) => {
      spyOn(communication, 'post').and.callFake(async () => null);

      const result = await service.executeCommand(1, 'CounterLCD', 'hello');

      expect(result).toBe(Result.Failed);
    }));
  });

  describe('loadFile', () => {
    it('should return file', inject([CommunicationService], async (communication: CommunicationService) => {
      const file = 'the test file';
      spyOn(communication, 'getFile').and.callFake(async () => file);

      const result = await service.loadFile('testPath');

      expect(result).not.toBe(null);
    }));

    it('should return null', inject([CommunicationService], async (communication: CommunicationService) => {
      spyOn(communication, 'getFile').and.callFake(async () => null);

      const result = await service.loadFile('testPath');

      expect(result).toBe(null);
    }));
  });

  describe('getServicesIDs', () => {
    it('should return IDS', inject([CommunicationService], async (communication: CommunicationService) => {
      const array = [
        { EntityName: 'M1_M2', AvailableActions: null, ID: 56, OrgID: 1, ClassName1: null, ClassName2: null, ObjectID1: 115, ObjectID2: 110, TableName: 'R__' },
        { EntityName: 'M1_M2', AvailableActions: null, ID: 69, OrgID: 1, ClassName1: null, ClassName2: null, ObjectID1: 115, ObjectID2: 133, TableName: 'R__' },
      ];

      const reqMessage = new Message();
      reqMessage.time = Date.now();
      reqMessage.payload = {
        data: [array],
        result: 0,
      };
      spyOn(communication, 'post').and.callFake(async () => reqMessage);

      const result = await service.getServicesIDs(115);

      expect(result).not.toBe(null);
      expect(result.length).toBe(2);
    }));

    it('should return null', inject([CommunicationService], async (communication: CommunicationService) => {
      spyOn(communication, 'post').and.callFake(async () => null);

      const result = await service.getServicesIDs(115);

      expect(result).toBe(null);
    }));

    it('should emit unAuthorizedAction', inject([CommunicationService], async (communication: CommunicationService) => {
      const reqMessage = new Message();
      reqMessage.time = Date.now();
      reqMessage.payload = {
        data: null,
        result: -3,
      };
      spyOn(communication, 'post').and.callFake(async () => reqMessage);
      const spy = spyOn(mockEventsService.unAuthorizedAction, 'emit');

      const result = await service.getServicesIDs(115);

      expect(result).toBe(null);
      expect(spy).toHaveBeenCalledTimes(1);
    }));
  });
});
