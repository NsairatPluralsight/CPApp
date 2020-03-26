import { ServiceStatus } from "./enum";

export class ServiceStatusReport {
  serviceName: string = "";
  lastUpdate?: string = "";
  status: ServiceStatus = ServiceStatus.Unknown;
  timestamp: number = -1;


  update(serviceStatusReport: ServiceStatusReport, timestamp: number, ignoreTimestamp: boolean = false) {
      if (this.timestamp < timestamp || ignoreTimestamp) {
          this.serviceName = serviceStatusReport.serviceName;
          this.lastUpdate = serviceStatusReport.lastUpdate;
          this.status = serviceStatusReport.status;
          this.timestamp = timestamp;
      }
  }

}
