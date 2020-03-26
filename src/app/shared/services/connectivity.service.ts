import { Injectable } from '@angular/core';
import { EventsService } from './events.service';
import { LoggerService } from './logger.service';
import { StateService } from './state.service';
import { InternalStatus, ServiceStatus } from '../models/enum';
import { Constants } from '../models/constants';
import { ServiceStatusReport } from '../models/service-status-report';
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {

  initialized: boolean;
  maxServerReconnectTrials = 2;
  serverReconnectInterval = 25000;
  reconnectInterval = 5000;
  maxReconnectMinutes = 2;

  private servicesToMaintain = [Constants.cCOMPONENT_SERVICE.toLowerCase(), Constants.cCVM_SERVER.toLowerCase()];

  private monitorConnectionInterval = undefined;
  private serviceStatusReports: ServiceStatusReport[] = [];
  private connected = true;
  private lastConnectivityUpdateTime: number;
  private endpointServiceStatusReport: ServiceStatusReport;


  constructor(private eventService: EventsService, private logger: LoggerService,
    private stateService: StateService) {
    this.eventService.reconnect.subscribe((result) => {
      this.handleReconnect(result)
    });

    this.eventService.servicesStatusUpdate.subscribe((message: Message) => {
      this.updateServicesStatusReports(message.payload.servicesStatuses, message.time);// Mn ween bde ajeb al time :/
    });
  }

  /**
   * @summary initializes the service with the initial status reports
   * @param serviceStatusReports - service status reports for all services
   */
  initialize(serviceStatusReports: ServiceStatusReport[], timeStamp: number) {
    try {
      this.endpointServiceStatusReport = new ServiceStatusReport();
      this.endpointServiceStatusReport.status = ServiceStatus.Working;
      this.endpointServiceStatusReport.serviceName = Constants.endpointModuleName.toLowerCase();
      this.serviceStatusReports = [];
      this.servicesToMaintain.forEach((service) => {
        let tempServiceStatusReports = new ServiceStatusReport();
        tempServiceStatusReports.serviceName = service;
        tempServiceStatusReports.status = ServiceStatus.Unknown;
        this.serviceStatusReports.push(tempServiceStatusReports);
      });
      this.updateServicesStatusReports(serviceStatusReports, timeStamp);
      this.initialized = true;
      this.monitorConnectivty();
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary resets the service
   */
  reset() {
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
  updateServicesStatusReports(serviceStatusReports: ServiceStatusReport[], timeStamp: number) {
    try {
      if (serviceStatusReports && serviceStatusReports.length > 0) {
        serviceStatusReports.forEach(report => {

          let index = this.serviceStatusReports.findIndex((p) => p.serviceName.toLowerCase() === report.serviceName.toLowerCase());
          if (index >= 0) {
            this.serviceStatusReports[index].update(report, timeStamp);
          };
        });

        this.handleServiceStatusReportsUpdate();
      }
    } catch (error) {
      this.logger.error(error);
    }
  }


  handleEndPointServiceConnectivityChanged(connected: boolean, timestamp: number = undefined) {
    try {
      let ignoreTimestamp = false;
      let newStatusReport = new ServiceStatusReport();
      newStatusReport.serviceName = Constants.endpointModuleName.toLowerCase();
      if (connected) {
        newStatusReport.status = ServiceStatus.Working;
      }
      else {
        newStatusReport.status = ServiceStatus.Error;
        if (!timestamp) {
          timestamp = this.endpointServiceStatusReport.timestamp;
        }
        ignoreTimestamp = true;
      }
      this.endpointServiceStatusReport.update(newStatusReport, timestamp, ignoreTimestamp);
      this.handleServiceStatusReportsUpdate();
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * @summary handle reconnecting based on the error returned from http request
   * @param {any} result - object that contains HttpErrorResponse and topic name
   */
  handleReconnect(result: any): void {
    try {
      if (result) {
        if (result.error.status == 408) {
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
  monitorConnectivty(): void {
    try {
      if (!this.monitorConnectionInterval) {
        this.monitorConnectionInterval = setInterval(() => {
          this.lastConnectivityUpdateTime = this.lastConnectivityUpdateTime ? this.lastConnectivityUpdateTime : Date.now();
          let timeDifference: number = this.dateDiffMinutes(Date.now(), this.lastConnectivityUpdateTime);

          if (timeDifference >= this.maxReconnectMinutes
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
  dateDiffMinutes(first: number, second: number) {
    try {
      return Math.round((Math.abs(second - first)) / (1000 * 60));
    } catch (error) {
      this.logger.error(error);
    }
  }
  /**
   * @summary handle status reports update from all endpoint
   */
  handleServiceStatusReportsUpdate() {
    try {

      if (this.endpointServiceStatusReport.status !== ServiceStatus.Working || (this.stateService.getStatus() !== InternalStatus.Connecting
        && (this.serviceStatusReports.findIndex((p) => (this.servicesToMaintain.includes(p.serviceName.toLowerCase()) && p.status !== ServiceStatus.Working)) >= 0
          || this.serviceStatusReports.findIndex((p) => this.servicesToMaintain.includes(p.serviceName.toLowerCase())) < 0))) {
        if (this.endpointServiceStatusReport.status === ServiceStatus.Working) {
          this.logger.info("Some of the services are disconnected/errored or not sending their status. Application will go to disconnected state.");
          this.logger.info("The following services status are reporetd from endpoint: " + JSON.stringify(this.serviceStatusReports));
        }
        else {
          this.logger.info("ُEndpoint Service is disconnected. Application will go to disconnected state.");
        }
        this.connected = false;
        this.eventService.connectivityChanged.emit();
      }
      else {
        if (this.endpointServiceStatusReport.status === ServiceStatus.Working && this.stateService.getStatus() === InternalStatus.Connecting
          && (this.serviceStatusReports.findIndex((p) => (this.servicesToMaintain.includes(p.serviceName.toLowerCase()) && p.status !== ServiceStatus.Working)) < 0)) {
          this.logger.info("All services are now connected. Application is in connected state.");
          this.logger.info("The following services status are reporetd from endpoint: " + JSON.stringify(this.serviceStatusReports));
          this.connected = true;
          this.eventService.connectivityChanged.emit();
        }
      }

      //update connectivity time when all the services are connected
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
  isConnected(): boolean {
    try {
      return (this.connected);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
