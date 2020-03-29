import { TestBed, fakeAsync, inject } from '@angular/core/testing';
import { ConnectivityService } from './connectivity.service';
import { LoggerService } from './logger.service';
import { EventEmitter } from '@angular/core';
import { EventsService } from './events.service';
import { StateService } from './state.service';
import { CommunicationService } from './communication.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ServiceStatusReport } from '../models/service-status-report';
import { Constants } from '../models/constants';
import { ServiceStatus, InternalStatus } from '../models/enum';

describe('ConnectivityService', () => {
  let service: ConnectivityService;
  let mockLoggerservice;

  const mockEventsService = {
    reconnect: new EventEmitter(),
    servicesStatusUpdate: new EventEmitter(),
    onDisconnect: new EventEmitter(),
    connectivityChanged: new EventEmitter(),
    statusUpdate: new EventEmitter(),
  };

  mockEventsService.reconnect = new EventEmitter();
  mockEventsService.servicesStatusUpdate = new EventEmitter();
  mockEventsService.onDisconnect = new EventEmitter();
  mockEventsService.connectivityChanged = new EventEmitter();
  mockEventsService.statusUpdate = new EventEmitter();

  const mockCommunicationService = {
    post: jasmine.createSpy('navigate'),
  };

  const mockStateService = {
    getStatus() {
      return InternalStatus.Ready;
    },
    setStatus(status: InternalStatus) {
      return;
    },
  };

  beforeEach(() => {
    mockLoggerservice = jasmine.createSpyObj(['error', 'info']);

    TestBed.configureTestingModule({
      providers: [ConnectivityService,
        { provide: EventsService, useValue: mockEventsService },
        { provide: LoggerService, useValue: mockLoggerservice },
        { provide: CommunicationService, useValue: mockCommunicationService },
        { provide: StateService, useValue: mockStateService },
      ],
    });

    service = TestBed.get(ConnectivityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('handleReconnect', () => {
    it('should emit onDisconnect when an error sttaus returned from endpoint (error: 0)', () => {
      const httpError = new HttpErrorResponse({
        status: 0,
      });
      const tTopic = '';
      const object = { error: httpError, topic: tTopic };
      const onDisconnectSpy = spyOn(mockEventsService.onDisconnect, 'emit');

      service.handleReconnect(object);
      expect(onDisconnectSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit onDisconnect and set the status to connecting when the request is timed out (error: 408)', inject([StateService], (stateService: StateService) => {
      const httpError = new HttpErrorResponse({
        status: 408,
      });
      const tTopic = '';
      const object = { error: httpError, topic: tTopic };
      const setStatusSpy = spyOn(stateService, 'setStatus').and.callFake((status: InternalStatus) => {
        return;
      });
      const connectivityChangedSpy = spyOn(mockEventsService.connectivityChanged, 'emit');

      service.handleReconnect(object);
      expect(connectivityChangedSpy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('initialize', () => {
    it('should call the required functions to initialize the service and start monitoring connection', fakeAsync(() => {
      const serviceStatusReport: ServiceStatusReport = new ServiceStatusReport();
      serviceStatusReport.serviceName = Constants.cCOMPONENT_SERVICE;
      serviceStatusReport.status = ServiceStatus.Unknown;
      const reports: ServiceStatusReport[] = [serviceStatusReport];
      const updateServicesStatusReportsSpy = spyOn(service, 'updateServicesStatusReports').and.callFake(() => { return; });
      const monitorConnectivtySpy = spyOn(service, 'monitorConnectivty').and.callFake(() => { return; });

      service.initialize(reports, new Date().getTime());

      expect(updateServicesStatusReportsSpy).toHaveBeenCalledTimes(1);
      expect(monitorConnectivtySpy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('handleServiceStatusReportUpdate', () => {
    it('should change the status to disconnected and infrom that connectivity changed', inject([StateService], (stateService: StateService) => {
      const serviceStatusReport: ServiceStatusReport = new ServiceStatusReport();
      serviceStatusReport.serviceName = Constants.cCOMPONENT_SERVICE;
      serviceStatusReport.status = ServiceStatus.Unknown;
      const reports: ServiceStatusReport[] = [serviceStatusReport];
      const getStatusSpy = spyOn(stateService, 'getStatus').and.callFake(() => {
        return InternalStatus.Ready;
      });
      const environmentStatusChangedSpy = spyOn(mockEventsService.connectivityChanged, 'emit');
      const updateServicesStatusReportsSpy = spyOn(service, 'updateServicesStatusReports').and.callFake(() => {
        return;
      });
      const monitorConnectivtySpy = spyOn(service, 'monitorConnectivty').and.callFake(() => {
        return;
      });

      service.initialize(reports, new Date().getTime());

      service.handleServiceStatusReportsUpdate();
      expect(service.isConnected()).toEqual(false);
      expect(environmentStatusChangedSpy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('updateServicesStatusReport', () => {

    it('should update services reports and call handleServiceStatusReportUpdate', fakeAsync(() => {
      const timestamp = new Date().getTime();
      const timestampBefore5Seconds = timestamp - 5000;
      const serviceStatusReport: ServiceStatusReport = new ServiceStatusReport();
      serviceStatusReport.serviceName = Constants.cCOMPONENT_SERVICE;
      serviceStatusReport.status = ServiceStatus.Error;
      serviceStatusReport.timestamp = timestampBefore5Seconds;
      const reports: ServiceStatusReport[] = [serviceStatusReport];
      service['serviceStatusReports'] = reports;

      const handleServiceStatusReportsUpdateSpy = spyOn(service, 'handleServiceStatusReportsUpdate').and.callFake(() => { return; });

      service.updateServicesStatusReports(reports, timestamp);
      expect(reports[0].timestamp).toEqual(timestamp);
      expect(handleServiceStatusReportsUpdateSpy).toHaveBeenCalledTimes(1);
    }));

    it('should not update services reports and call handleServiceStatusReportUpdate', fakeAsync(() => {
      const timestamp = new Date().getTime();
      const timestampBefore5Seconds = timestamp - 5000;
      const serviceStatusReport: ServiceStatusReport = new ServiceStatusReport();
      serviceStatusReport.serviceName = Constants.cCOMPONENT_SERVICE;
      serviceStatusReport.status = ServiceStatus.Error;
      serviceStatusReport.timestamp = timestamp;
      const reports: ServiceStatusReport[] = [serviceStatusReport];
      service['serviceStatusReports'] = reports;

      const handleServiceStatusReportsUpdateSpy = spyOn(service, 'handleServiceStatusReportsUpdate').and.callFake(() => { return; });

      service.updateServicesStatusReports(reports, timestampBefore5Seconds);
      expect(reports[0].timestamp).toEqual(timestamp);
      expect(handleServiceStatusReportsUpdateSpy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('handleEndPointServiceConnectivityChanged', () => {

    it('should call the correct functions to disconnect the app when endpoint is disconncted', fakeAsync(() => {
      const timestamp = new Date().getTime();
      const timestampBefore5Seconds = timestamp - 5000;
      const handleServiceStatusReportsUpdateSpy = spyOn(service, 'handleServiceStatusReportsUpdate').and.callFake(() => { return; });

      // initialize endpointServiceStatusReport
      service['endpointServiceStatusReport'] = new ServiceStatusReport();
      service['endpointServiceStatusReport'].status = ServiceStatus.Working;
      service['endpointServiceStatusReport'].serviceName = Constants.endpointModuleName.toLowerCase();
      service['endpointServiceStatusReport'].timestamp = timestampBefore5Seconds;
      service.handleEndPointServiceConnectivityChanged(true, timestamp);
      expect(service['endpointServiceStatusReport'].timestamp).toEqual(timestamp);
      expect(handleServiceStatusReportsUpdateSpy).toHaveBeenCalledTimes(1);
    }));

    it('should not call the correct functions to disconnect the app when endpoint is disconncted', fakeAsync(() => {
      const timestamp = new Date().getTime();
      const timestampBefore5Seconds = timestamp - 5000;
      const handleServiceStatusReportsUpdateSpy = spyOn(service, 'handleServiceStatusReportsUpdate').and.callFake(() => { return; });

      // initialize endpointServiceStatusReport
      service['endpointServiceStatusReport'] = new ServiceStatusReport();
      service['endpointServiceStatusReport'].status = ServiceStatus.Working;
      service['endpointServiceStatusReport'].serviceName = Constants.endpointModuleName.toLowerCase();
      service['endpointServiceStatusReport'].timestamp = timestamp;
      service.handleEndPointServiceConnectivityChanged(true, timestampBefore5Seconds);
      expect(service['endpointServiceStatusReport'].timestamp).toEqual(timestamp);
      expect(handleServiceStatusReportsUpdateSpy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('reset', () => {
    it('should reset the service', fakeAsync(() => {
      service.reset();
      expect(service.isConnected()).toEqual(true);
    }));
  });

  describe('isConnected', () => {
    it('it should return true', () => {
      const isConnected = service.isConnected();

      expect(isConnected).toBe(true);
    });
  });
});
