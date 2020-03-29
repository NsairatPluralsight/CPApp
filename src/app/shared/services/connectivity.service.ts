import { Injectable } from '@angular/core';
import { EventsService } from './events.service';
import { LoggerService } from './logger.service';
import { StateService } from './state.service';
import { InternalStatus, ServiceStatus } from '../models/enum';
import { Constants } from '../models/constants';
import { ServiceStatusReport } from '../models/service-status-report';
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root',
})
export class ConnectivityService {
  public initialized: boolean;
  public maxServerReconnectTrials = 2;
  public serverReconnectInterval = 25000;
  public reconnectInterval = 5000;
  public maxReconnectMinutes = 2;
  private servicesToMaintain = [Constants.cCOMPONENT_SERVICE.toLowerCase(), Constants.cCVM_SERVER.toLowerCase()];
  private monitorConnectionInterval = undefined;
  private serviceStatusReports: ServiceStatusReport[] = [];
  private connected = true;
  private lastConnectivityUpdateTime: number;
  private endpointServiceStatusReport: ServiceStatusReport;

  constructor(private eventService: EventsService, private logger: LoggerService,
              private stateService: StateService) {
    this.eventService.reconnect.subscribe((result) => {
      this.handleReconnect(result);
    });

    this.eventService.servicesStatusUpdate.subscribe((message: Message) => {
      this.updateServicesStatusReports(message.payload.servicesStatuses, message.time); // Mn ween bde ajeb al time :/
    });
  }

  /**
   * @summary initializes the service with the initial status reports
   * @param serviceStatusReports - service status reports for all services
   */
  public initialize(pServiceStatusReports: ServiceStatusReport[], pTimeStamp: number) {
    try {
      this.endpointServiceStatusReport = new ServiceStatusReport();
      this.endpointServiceStatusReport.status = ServiceStatus.Working;
      this.endpointServiceStatusReport.serviceName = Constants.endpointModuleName.toLowerCase();
      this.serviceStatusReports = [];
      this.servicesToMaintain.forEach((service) => {
        const tTempServiceStatusReports = new ServiceStatusReport();
        tTempServiceStatusReports.serviceName = service;
        tTempServiceStatusReports.status = ServiceStatus.Unknown;
        this.serviceStatusReports.push(tTempServiceStatusReports);
      });
      this.updateServicesStatusReports(pServiceStatusReports, pTimeStamp);
      this.initialized = true;
      this.monitorConnectivty();
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary resets the service
   */
  public reset() {
    try {
      this.connected = true;
      if (this.monitorConnectionInterval) {
        clearInterval(this.monitorConnectionInterval);
        this.monitorConnectionInterval = undefined;
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary updates the current service statuses from all services
   * @param serviceStatusReports - service status reports for all services
   */
  public updateServicesStatusReports(pServiceStatusReports: ServiceStatusReport[], pTimeStamp: number) {
    try {
      if (pServiceStatusReports && pServiceStatusReports.length > 0) {
        pServiceStatusReports.forEach((report) => {
          const tIndex = this.serviceStatusReports.findIndex((p) => p.serviceName.toLowerCase() === report.serviceName.toLowerCase());
          if (tIndex >= 0) {
            this.serviceStatusReports[tIndex].update(report, pTimeStamp);
          }
        });
        this.handleServiceStatusReportsUpdate();
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  public handleEndPointServiceConnectivityChanged(pConnected: boolean, pTimeStamp?: number) {
    try {
      let ignoreTimestamp = false;
      const newStatusReport = new ServiceStatusReport();
      newStatusReport.serviceName = Constants.endpointModuleName.toLowerCase();
      if (pConnected) {
        newStatusReport.status = ServiceStatus.Working;
      } else {
        newStatusReport.status = ServiceStatus.Error;
        if (!pTimeStamp) {
          pTimeStamp = this.endpointServiceStatusReport.timestamp;
        }
        ignoreTimestamp = true;
      }
      this.endpointServiceStatusReport.update(newStatusReport, pTimeStamp, ignoreTimestamp);
      this.handleServiceStatusReportsUpdate();
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary handle reconnecting based on the error returned from http request
   * @param {any} result - object that contains HttpErrorResponse and topic name
   */
  public handleReconnect(pResult: any): void {
    try {
      if (pResult) {
        if (pResult.error.status === 408) {
          this.connected = false;
          this.eventService.connectivityChanged.emit();
        } else {
          this.eventService.onDisconnect.emit();
        }
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary check if all services are alive each 5 seconds for 2 minutes and disconnect if the one or more services are disconnected or errored
   *
   */
  public monitorConnectivty(): void {
    try {
      if (!this.monitorConnectionInterval) {
        this.monitorConnectionInterval = setInterval(() => {
          this.lastConnectivityUpdateTime = this.lastConnectivityUpdateTime ? this.lastConnectivityUpdateTime : Date.now();
          const pTimeDifference: number = this.dateDiffMinutes(Date.now(), this.lastConnectivityUpdateTime);

          if (pTimeDifference >= this.maxReconnectMinutes
            && this.initialized
            && this.stateService.getStatus() === InternalStatus.Connecting) {
            this.eventService.onDisconnect.emit();
          }
        }, this.reconnectInterval);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary find the date diff in minutes between two dates
   * @param first first date
   * @param second second date
   */
  public dateDiffMinutes(pFirst: number, pSecond: number) {
    try {
      return Math.round((Math.abs(pSecond - pFirst)) / (1000 * 60));
    } catch (error) {
      this.logger.error(error);
    }
  }
  /**
   * @summary handle status reports update from all endpoint
   */
  public handleServiceStatusReportsUpdate() {
    try {
      if (this.endpointServiceStatusReport.status !== ServiceStatus.Working || (this.stateService.getStatus() !== InternalStatus.Connecting
        && (this.serviceStatusReports.findIndex((p) => (this.servicesToMaintain.includes(p.serviceName.toLowerCase()) && p.status !== ServiceStatus.Working)) >= 0
          || this.serviceStatusReports.findIndex((p) => this.servicesToMaintain.includes(p.serviceName.toLowerCase())) < 0))) {
        if (this.endpointServiceStatusReport.status === ServiceStatus.Working) {
          this.logger.info('Some of the services are disconnected/errored or not sending their status. Application will go to disconnected state.');
          this.logger.info('The following services status are reporetd from endpoint: ' + JSON.stringify(this.serviceStatusReports));
        } else {
          this.logger.info('ُEndpoint Service is disconnected. Application will go to disconnected state.');
        }
        this.connected = false;
        this.eventService.connectivityChanged.emit();
      } else {
        if (this.endpointServiceStatusReport.status === ServiceStatus.Working && this.stateService.getStatus() === InternalStatus.Connecting
          && (this.serviceStatusReports.findIndex((p) => (this.servicesToMaintain.includes(p.serviceName.toLowerCase()) && p.status !== ServiceStatus.Working)) < 0)) {
          this.logger.info('All services are now connected. Application is in connected state.');
          this.logger.info('The following services status are reporetd from endpoint: ' + JSON.stringify(this.serviceStatusReports));
          this.connected = true;
          this.eventService.connectivityChanged.emit();
        }
      }

      // update connectivity time when all the services are connected
      if (this.stateService.getStatus() !== InternalStatus.Connecting) {
        this.lastConnectivityUpdateTime = Date.now();
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary return the connection status overall connected services
   * @returns {boolean} - true if all services are connected and false otherwise.
   */
  public isConnected(): boolean {
    try {
      return (this.connected);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
