export class ReportObj {
  Id: number;
  ReportName: string;
  ReportDescription: string;
  AppId: string;
  TemplateId: string;
  CreatedUserId: string;
  CreatedTime: Date;
  LastModifiedTime: Date;
  LastRunTime: Date;
  IsDeleted: boolean;
  DeletedTime: Date;
  RptPath: string;
  TenantId: string;
  ReportParams: string;
  ReportFormat: string;
  HasChild:boolean=false;
  userId: string;
}