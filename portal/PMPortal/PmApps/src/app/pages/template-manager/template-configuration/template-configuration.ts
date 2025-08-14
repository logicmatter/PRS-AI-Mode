export class TemplateConfiguration {
    public constructor(init?: Partial<TemplateConfiguration>) {
        Object.assign(this, init);
    }
    tenantId: string;
    tenantName: string;
    headerImageName: string;
    footerImageName: string;
    headerImage: File;
    footerImage: File;
    headerImageType: string;
    footerImageType: string;
    headerImageBase64: any;
    footerImageBase64: any;
    headerBackgroundColor: string;
    headerForegroundColor: string;
    footerBackgroundColor: string;
    footerForegroundColor: string;
    scheduledReportsFilePath: string;
    useSameSettingsForFooter: boolean;
}
