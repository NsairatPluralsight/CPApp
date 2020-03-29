import { Direction } from './enum';

export class Counter {
  public id: number;
  public number: string;
  public direction: Direction;
  public assigned: boolean;
  public name_L1: string;
  public name_L2: string;
  public name_L3: string;
  public name_L4: string;

  constructor(pID: number, pNumber: string, pDirection: number, pAssigned: boolean,
              pName_L1: string, pName_L2: string, pName_L3: string, pName_L4: string) {

    this.id = pID;
    this.number = pNumber;
    this.direction = pDirection ? pDirection : Direction.None;
    this.assigned = pAssigned ? pAssigned : false;
    this.name_L1 = pName_L1;
    this.name_L2 = pName_L2;
    this.name_L3 = pName_L3;
    this.name_L4 = pName_L4;
  }
}
