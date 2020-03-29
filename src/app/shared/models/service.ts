export class Service {
  public id: number;
  public nameL1: string;
  public nameL2: string;
  public nameL3: string;
  public nameL4: string;
  public assigned: boolean;

  constructor(pID: number, pName: string, pAssigned: boolean) {
    this.id = pID;
    this.nameL1 = pName;
    this.assigned = pAssigned;
  }
}
