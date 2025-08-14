export class AppTemplates {
  public constructor(init?: Partial<AppTemplates>) {
        Object.assign(this, init);
    }
  id: string;
  appId: string;
  appName: string;
  tenantId: string;
  templateName: string;
  description: string;
  templatePath: string;
  templateType: string;
  templateFile: File;
  tenantInfo: any;
  validationErrors: [];
}
