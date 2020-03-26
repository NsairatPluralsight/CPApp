import { Constants } from "./constants";

export class Filter {
  text: string;
  columns: string;

  constructor() {
    this.columns = `${Constants.cTYPE_NAME},${Constants.cNAME_L1},${Constants.cIDENTITY},${Constants.cADDRESS}`
  }
}
