export class UICVMComponent {
  public id: number;
  public typeName: string;
  public name: string;
  public identity: string;
  public address: string;
  public branch: string;

  constructor(pID: number, pTypeName: string, pName: string, pIdentity: string, pAddress: string, pBranch: string) {
      this.id = pID;
      this.typeName = pTypeName;
      this.name = pName;
      this.identity = pIdentity;
      this.address = pAddress;
      this.branch = pBranch;
  }
}
