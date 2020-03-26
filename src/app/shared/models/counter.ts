import { Direction } from "./enum";

export class Counter {

  constructor(pID: number, pNumber: string, pDirection: number, pAssigned: boolean,
    pName_L1: string, pName_L2: string, pName_L3: string, pName_L4: string) {

    this.id = pID;
    this.number = pNumber;
    this.direction = pDirection ? pDirection: Direction.None;
    this.assigned = pAssigned ? pAssigned: false;
    this.name_L1 = pName_L1;
    this.name_L2 = pName_L2;
    this.name_L3 = pName_L3;
    this.name_L4 = pName_L4;
  }

  id: number;
  number: string;
  direction: Direction;
  assigned: boolean;
  name_L1: string;
  name_L2: string;
  name_L3: string;
  name_L4: string;
}

export class MainLCDCounter {
  id: number;
  direction: Direction;

  constructor(pID: number, pDirection: Direction) {
    this.id = pID;
    this.direction = pDirection;
  }
}
