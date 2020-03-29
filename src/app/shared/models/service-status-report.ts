import { ServiceStatus } from './enum';

export class ServiceStatusReport {
  public serviceName: string = '';
  public lastUpdate?: string = '';
  public status: ServiceStatus = ServiceStatus.Unknown;
  public timestamp: number = -1;

  public update(serviceStatusReport: ServiceStatusReport, timestamp: number, ignoreTimestamp: boolean = false) {
      if (this.timestamp < timestamp || ignoreTimestamp) {
          this.serviceName = serviceStatusReport.serviceName;
          this.lastUpdate = serviceStatusReport.lastUpdate;
          this.status = serviceStatusReport.status;
          this.timestamp = timestamp;
      }
  }
}
