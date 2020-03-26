export class Service {
  id: number;
  nameL1: string;
  nameL2: string;
  nameL3: string;
  nameL4: string;
  assigned: boolean;

  constructor(pID: number, pName: string, pAssigned: boolean) {
    this.id = pID;
    this.nameL1 = pName;
    this.assigned = pAssigned;
  }
}
