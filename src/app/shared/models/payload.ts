export class ResponsePayload {
  data: any;
  result: number;
}

export class RequestPayload {
  orgID: number;
  typeName: string;
  branchID: number;
  componentID: number;
  data: string;
  entityName: string;
  orderBy: string;
  limit: number;
  pageNumber: number
  filter: string;
}

export class ServerPayload {
  target: string;
  data: string;
}
