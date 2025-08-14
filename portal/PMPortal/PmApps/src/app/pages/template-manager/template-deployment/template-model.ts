export class AppTemplates {
  //public constructor(init?: Partial<AppTemplates>) {
  //      Object.assign(this, init);
  //  }
  id: string;
  appId: string;
  appName: string;
  tenantId: string;
  templateName: string;
  description: string;
  templatePath: string;
  templateType: string;
  templateFile: File;
  rdlFilePath: string;
  reportType: string;
  tenantInfo: any;
  validationErrors: [];
 
  GrafanatemplateFile: File;
  GrafanadashboardUId: string;
  GrafanadashboardId:string;
  GrafanatenantId: string;
  GrafanatemplateName: string;
  Grafanadescription: string;
  GrafanaappId: string;
  GrafanaappName: string;
  GrafanatemplateType: string;
  GrafanareportType: string;
  GrafanardlFilePath: string;
  GrafanatenantInfo: any;
  GrafanatemplatePath: string;
  Grafanaid:string;
}