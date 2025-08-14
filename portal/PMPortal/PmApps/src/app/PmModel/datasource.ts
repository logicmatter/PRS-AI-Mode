export class Datasource {

  public constructor(init?: Partial<Datasource>) {
    Object.assign(this, init);
  }
  connectorType: string;
  dataSourceId: number;
  id: string;
  dataSourceName: string;
  dataSourceDescription: string;
  defineFlow: string;
  serverUrl: string;
  username: string;
  password: string;
  confirmPassword: string;
  connectorOptions: string;
  templateSheetId: string;
  scheduleId: string;
  savedSourceFileName: string;
  sourceFile: File;
  sourceFileName: string = "Choose file";
  sourceFileLocation: string;
  sourceGoogleSheetId: string;
  sourceGoogleFolderId: string;
  tenantId: string;
  extractionMethod: string;
  templateEmbedUrl: string;
  createdBy: string;
  modifiedBy: string;
  loadStartFrom: string;
  loadEndTo: string;
  createdDate: string;
  fileExtraction: string;
  fileType: string;
  fileProtocol: string;
  uploadMethod: string;
  filePackage: string;
  templateName: string;
  manualMethod: string;
  clientSecretID: string;
  clientSecretKey: string;
  systemID:string;
  customerID: string;
  cloudDataKeys: string;
  serverInstance:string;
  portNumber:string;
  sourceDBName:string;
  gatewayName:string;
  initialLoadingDays:string;
  authenticationType:string;
}

export class DataFlow {
  public constructor(init?: Partial<DataFlow>) {
    Object.assign(this, init);
  }

  connectorType: string;
  dataFlowId: number;
  id: string;
  dataFlowName: string;
  dataFlowDescription: string;
  defineFlow: string;
  serverUrl: string;
  username: string;
  password: string;
  confirmPassword: string;
  connectorOptions: string;
  templateSheetId: string;
  scheduleId: string;
  savedSourceFileName: string;
  sourceFile: File;
  sourceFileName: string = "Choose file";
  sourceFileLocation: string;
  sourceGoogleSheetId: string;
  sourceGoogleFolderId: string;
  tenantId: string;
  extractionMethod: string;
  templateEmbedUrl: string;
  createdBy: string;
  modifiedBy: string;
  


}