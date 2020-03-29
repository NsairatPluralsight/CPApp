export class Permission {
  public create: boolean;
  public read: boolean;
  public edit: boolean;
  public delete: boolean;
  public report: boolean;

  constructor(pCreate: boolean, pRead: boolean, pEdit: boolean, pDelete: boolean, pReport: boolean) {
    this.create = pCreate;
    this.read = pRead;
    this.edit = pEdit;
    this.delete = pDelete;
    this.report = pReport;
  }
}
