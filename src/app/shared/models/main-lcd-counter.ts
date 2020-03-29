import { Direction } from './enum';

export class MainLCDCounter {
    public id: number;
    public direction: Direction;

    constructor(pID: number, pDirection: Direction) {
      this.id = pID;
      this.direction = pDirection;
    }
}
