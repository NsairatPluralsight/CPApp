import { TestBed } from '@angular/core/testing';
import { StateService } from './state.service';
import { LoggerService } from './logger.service';
import { EventsService } from './events.service';
import { EventEmitter } from '@angular/core';
import { InternalStatus } from '../models/enum';

describe('StateService', () => {
  let service: StateService;
  let mockLoggerservice;
  let mockEventsService;

  mockEventsService = {
    statusUpdate: new EventEmitter(),
  };
  mockEventsService.statusUpdate = new EventEmitter();

  beforeEach(() => {
    mockLoggerservice = jasmine.createSpyObj(['error', 'info']);
    TestBed.configureTestingModule({
      providers: [StateService,
        { provide: EventsService, useValue: mockEventsService },
        { provide: LoggerService, useValue: mockLoggerservice },
      ],
    });
    service = TestBed.get(StateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setStatus', () => {
    it('should emit an event', () => {
      const spy = spyOn(mockEventsService.statusUpdate, 'emit');

      service.setStatus(InternalStatus.Ready);

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getStatus', () => {
    it('should get status error', () => {
      service.setStatus(InternalStatus.Error);

      const result = service.getStatus();

      expect(result).toBe(InternalStatus.Error);
    });

    it('should get status ready', () => {
      service.setStatus(InternalStatus.Ready);

      const result = service.getStatus();

      expect(result).toBe(InternalStatus.Ready);
    });
  });
});
