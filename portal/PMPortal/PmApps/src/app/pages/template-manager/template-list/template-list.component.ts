import { Component, OnInit, OnDestroy } from '@angular/core';
//import { TenantList } from '../../tenant-settings/tenant-list/tenant-list';
import { TenantService } from '../../../PmCore/services/TenantService/TenantService.service';
import { AppTemplates } from './template-model';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonModel } from '../../../PmModel/common.model';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialog, AppUtilService } from 'src/app/PmCore/shared/app-util.service';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
//import { WindowsUserInfo } from '../../tenant-settings/tenant-list/windows-user-info';

@Component({
    selector: 'app-template-list',
    templateUrl: './template-list.component.html',
    styleUrls: ['./template-list.component.css'],
    styles: [`
    mat-card {
      border: 0.5px solid #ccc; /* Border color */
      margin-bottom: 1px; /* Space between mat-card elements */
      margin-top: 10px;
      padding: 10px; /* Padding inside mat-card elements */
    }
    
    
    .arrow {
      display: inline-block;
      width: 0;
      height: 0;
      vertical-align: middle;
      border-left: 10px solid transparent; /* Increase border width for a larger arrow */
      border-right: 10px solid transparent; /* Increase border width for a larger arrow */
      font-size: 18px; /* Increase font size for a larger arrow */
    }

    .arrow-down {
      border-top: 10px solid #000; /* Adjust the color as needed */
      transform: rotate(0deg);
      transition: transform 0.2s ease-in-out;
    }

    .arrow-right {
      border-bottom: 10px solid #000; /* Adjust the color as needed */
      transform: rotate(90deg);
      transition: transform 0.2s ease-in-out;
    }
  `]
})
export class TemplateListComponent implements OnInit, OnDestroy {
    tenants: CommonModel;
    public tenantList: any;
    public templatesList: AppTemplates[];
    public GrafanatenantList: any;
    public GrafanatemplatesList: AppTemplates[];
    public selectedTenant: any;
    public isLoading: boolean = false;
    public templateInfo: AppTemplates;
    public result: any;
    public tenantInfo: any;
    public windowsUserInfo: any;
    public userValidationMsg: string = '';
    public modalHeader: string;
    public modalBody: string;
    public showSQLServerError: boolean = false;
    public isRdlTemplatesListExpanded: boolean = false; 
    public isGrafanaTemplatesListExpanded: boolean = false;
    filter;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  public commonModel: CommonModel;
  previousTenant: string;
  constructor(private _configService: TenantService,
              public dialog: MatDialog, 
              public coreService: CoreUtilityService,
              public _utility:AppUtilService) { 
    this.coreService.filter = "";
  }

  ngOnInit() {
    this.commonModel = this._configService.currentTenantValue;
        this.isLoading = true;
        this.tenantList = [];
        this.templatesList = [];
        this.templateInfo = new AppTemplates();
        //this.tenantInfo = new TenantList({});
        //this.windowsUserInfo = new WindowsUserInfo({});
        this.getTenants();
    }
    //onChangeTenant(tenant: TenantList) {
    //    this.getTemplatesList(this.selectedTenant);
    //}
  getTenants() {
    this._configService.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      tenant => {
        this.tenants = tenant;
        if (tenant.tenantId === undefined) {
          return;
        } else if(!tenant.hasOwnProperty("tenantId") || !tenant.hasOwnProperty("userId")){
            return;
          }
          this.getTemplatesList(tenant.tenantId);
          this.getGrafanaList(tenant.tenantId);
          
      }, err => {
        console.log(err);
      });
  }

    public getTenantList(): void {
       
    }
    public getTemplatesList(tenantId) {
        this.isLoading = true;
        this.templatesList = [];
        this._configService.getTemplatesList(tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
            if (resp) {
                this.templatesList = resp;
            }
            this.isLoading = false;
        }, err => {
            this.isLoading = false;
            this.modalHeader = "Failed";
            this.modalBody = err.error.Message;
            this.warningDialog(this.modalHeader);
        });
    }
    public getGrafanaList(tenantId) {
      this.isLoading = true;
      this.GrafanatemplatesList = [];
      this._configService.getGrafanaTemplatesList(tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
          if (resp) {
              this.GrafanatemplatesList = resp;
          }
          this.isLoading = false;
      }, err => {
          this.isLoading = false;
          this.modalHeader = "Failed";
          this.modalBody = err.error.Message;
          this.warningDialog(this.modalHeader);
      });
  }
  public downloadRdl(template: AppTemplates) {
    if(!this._utility.licenseInfo.templateManagerEnabled){
      let msgTitle = "Info";
      let msgBody = "This feature is not available in this Edition. Please contact LogicMatter at <b>support@logicmatter.com</b>";
      this._utility.warningCommonDialog(msgBody, msgTitle);
      return;
    }
    this._configService.downloadReportDefinition(this.commonModel.tenantId, template.templatePath+'/'+template.templateName).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([resp]));
            a.download = template.templateName + ".rdl";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }, err => {
            this.modalHeader = "Failed";
            this.modalBody = "Failed to download RDL from Report Server";
            this.warningDialog(this.modalHeader);
        });
    }
  
    public downloadjson(template: AppTemplates) {
      if(!this._utility.licenseInfo.templateManagerEnabled){
        let msgTitle = "Info";
        let msgBody = "This feature is not available in this Edition. Please contact LogicMatter at <b>support@logicmatter.com</b>";
        this._utility.warningCommonDialog(msgBody, msgTitle);
        return;
      }
      this._configService.downloadDashboardDefinition(this.commonModel.tenantId, template.templateName).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
              const a = document.createElement("a");
              a.href = URL.createObjectURL(new Blob([resp]));
              a.download = template.templateName + ".json";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
          }, err => {
              this.modalHeader = "Failed";
              this.modalBody = "Failed to download RDL from Report Server";
              this.warningDialog(this.modalHeader);
          });
      }

      public toggleRdlTemplatesListExpansion(): void {
        this.coreService.filter = "";
        this.isRdlTemplatesListExpanded = !this.isRdlTemplatesListExpanded;
        this.isGrafanaTemplatesListExpanded = false;
      }
      
      public toggleGrafanaTemplatesListExpansion(): void {
        this.coreService.filter = "";
        this.isRdlTemplatesListExpanded = false;
        this.isGrafanaTemplatesListExpanded = !this.isGrafanaTemplatesListExpanded;

      }

  
    warningDialog(title) {
      const dialogRef = this.dialog.open(DeleteDialog, {
        width: "390px",
        data: { id: 0, type: '', message: this.modalBody, action: 'Warning', title: title }
      });
    }
    ngOnDestroy() {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }
}