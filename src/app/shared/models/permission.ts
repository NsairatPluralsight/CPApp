export class Permission {
  create: boolean;
  read: boolean;
  edit: boolean;
  delete: boolean;
  report: boolean;

  constructor(pCreate: boolean, pRead: boolean, pEdit: boolean, pDelete: boolean, pReport: boolean) {
    this.create = pCreate;
    this.read = pRead;
    this.edit = pEdit;
    this.delete = pDelete;
    this.report = pReport;
  }
}

