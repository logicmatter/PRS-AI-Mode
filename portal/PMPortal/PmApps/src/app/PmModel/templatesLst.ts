
export class TemplatesList {
  authentication: string;
  username: string;
  password: string;
  databaseName: string;
  sqlServerInstance: string;
  sqlServerPort: string;
  sqlServerName: string;
  public constructor(init?: Partial<TemplatesList>) {
    Object.assign(this, init);
  }

  templateId: string;
  templateName: string;
  connectorid: string;
  templateEmbedUrl: string;
  templateSheetId: string;
}
