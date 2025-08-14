import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
//import { TenantList } from '../../tenant-settings/tenant-list/tenant-list';
import { TenantService } from '../../../PmCore/services/TenantService/TenantService.service';
import { AppTemplates } from './template-model';
//import { WindowsUserInfo } from '../../tenant-settings/tenant-list/windows-user-info';
//import { isArray } from 'util';
import * as $ from "jquery";
import { CommonModel } from '../../../PmModel/common.model';
import { MatDialog } from '@angular/material/dialog';
import {
  AppUtilService,
  DeleteDialog
} from "src/app/PmCore/shared/app-util.service";
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-template-deployment',
  templateUrl: './template-deployment.component.html'
})
export class TemplateDeploymentComponent implements OnInit, OnDestroy {

  public tenantList: [];
  public appsList: any;
  public selectedTenant: any;
  public selectedApp: any = {};
  public isLoading: boolean = true;
  public templateInfo: AppTemplates;
  public result: any;
  public tenantInfo: any;
  public GrafanatenantInfo: any;
  public windowsUserInfo: any;
  public userValidationMsg: string = '';
  public templateValidationErrors = [];
  public GrafanatemplateValidationErrors = [];
  fileToUpload: File;
  sqlFileToUpload: File;
  public defaultUserForm: boolean = true;
  public moreChoices: boolean = false;
  public showLoadButton: boolean = false;
  public showLoadButton1: boolean = false;
  public modalHeader: string;
  public modalBody: string;
  public showFadeOutLoader: boolean = false;
  public GrafanashowFadeOutLoader: boolean = false;
  public showSQLServerError: boolean = false;
  public isEyeClicked: boolean = true;
  public inputType: string = "password";
  public commonModel: CommonModel;
  public overwriteTemplate: boolean = false;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  @ViewChild('templateFile', { static: false }) templateFile: ElementRef;
  @ViewChild('GrafanatemplateFile', { static: false }) GrafanatemplateFile: ElementRef;

  inputTemplateFile: ElementRef;
  constructor(private _configService: TenantService, public dialog: MatDialog, public _utility: AppUtilService) { }

  ngOnInit() {
    this.isLoading = true;
    this.templateInfo = new AppTemplates();
    //this.tenantInfo = new TenantList({});
    //this.windowsUserInfo = new WindowsUserInfo({});
    this.commonModel = this._configService.currentTenantValue;
    this.isLoading = false;
    //this.getAppsList();
    this.getTenants();
  }

  getTenants() {
    this._configService.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      tenant => {
        if (tenant === undefined) {
          return;
        } else if (tenant.tenantId == undefined) {
          return;
        }
        this.showFadeOutLoader = false;
        this.GrafanashowFadeOutLoader = false
        this.sqlFileToUpload = null;
        this.fileToUpload = null;
        this.templateInfo = new AppTemplates();
        this.templateValidationErrors = [];
        this.GrafanatemplateValidationErrors = [];
        this.commonModel = this._configService.currentTenantValue;

      }, err => {
        console.log(err);
      });
  }

  onChangeTenant(evt) {
    this.templateInfo = new AppTemplates();
  }

  public getTenantList(): void {

  }
  public verifyTemplateNameExists(templateName) {
    this.userValidationMsg = '';
    if (this.showLoadButton) { return; }

    if (templateName.trim()) {
      this.showFadeOutLoader = true;
      this._configService.verifyTemplateExists(templateName.trim(), this.commonModel.tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
        this.result = {};
        this.result = resp;
        this.showLoadButton = false;
        this.showFadeOutLoader = false;
        if (this.result) {
          if (Array.isArray(this.result.value)) {
            if (this.result.value.length > 0) {
              this.templateInfo.templatePath = this.result.value[0].templatePath;
              if (this.templateInfo.templateType.toLowerCase() === this.result.value[0].templateType.toLowerCase()) {
                this.templateInfo.id = this.result.value[0].id;
                //this.showFadeOutLoader = false;
                this.modalBody = '<b> ' + this.templateInfo.templateName +
                  '</b> already exists and is of <u>' + this.templateInfo.templateType + '</u > Template type(tt).Do you want to overwrite the existing report ? </span>' +
                  '<p> If not, click on cancel then rename the RDL file and try again </p>';
                this.confirmationDialog();
                //document.getElementById("ReportRedeployModalPopupWindow").click();
              } else {
                this.showFadeOutLoader = false;
                this.templateInfo.templatePath = '';
                this.templateInfo.id = '';
                this.templateInfo.templateName = '';
                this.modalHeader = "Message";
                this.modalBody = 'Template name "' + templateName + '" already exists and the Template type(tt) is "' + this.result.value[0].templateType + '", which is not matching with existing Template Type. Please verify before you continue to deploy.';
                this.warningDialog('Message');
                //document.getElementById("tempDeployModalPopupWindow").click();
              }
            }
          }
        } else {
          this.showLoadButton = false;
          this.showFadeOutLoader = false;
        }
      }, err => {
        this.showLoadButton = false;
        this.showFadeOutLoader = false;
        //this.logData("Error", err.error.InnerException.Message);
      });
    } else {
      this.showLoadButton = false;
      this.showFadeOutLoader = false;
      this.templateInfo.templateName = '';
    }

  }
  public verifyGrafanatemplateNameExists(GrafanatemplateName) {
    this.userValidationMsg = '';
    if (this.showLoadButton1) { return; }

    if (GrafanatemplateName.trim()) {
      this.GrafanashowFadeOutLoader = true;
      this._configService.verifyGrafanaTemplateExists(GrafanatemplateName.trim(), this.commonModel.tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
        this.result = {};
        this.result = resp;
        this.showLoadButton1 = false;
        this.GrafanashowFadeOutLoader = false;
        if (this.result != '') {
          if (this.result.length > 0) {
            this.templateInfo.GrafanardlFilePath = this.result[0].templatePath;
            console.log(this.templateInfo);
            if (this.templateInfo.GrafanatemplateType.toLowerCase() === this.result[0].templateType.toLowerCase()) {
              // this.templateInfo.Grafanaid = this.result.value[0].id;
              //this.showFadeOutLoader = false;
              this.modalBody = '<b> ' + this.templateInfo.GrafanatemplateName +
                '</b> already exists and is of <u>' + this.templateInfo.GrafanatemplateType + '</u > Template type(tt).Do you want to overwrite the existing report ? </span>' +
                '<p> If not, click on cancel then rename the RDL file and try again </p>';
              this.confirmationDialog();
              //document.getElementById("ReportRedeployModalPopupWindow").click();
            } else {

              this.GrafanashowFadeOutLoader = false;
              this.templateInfo.GrafanatemplatePath = '';
              this.templateInfo.Grafanaid = '';
              this.templateInfo.GrafanatemplateName = this.result[0].templateName;
              this.modalHeader = "Message";
              this.modalBody = 'Grafana Template name "' + GrafanatemplateName + '" already exists and the Template type(tt) is "' + this.result.value[0].GrafanatemplateType + '", which is not matching with existing Template Type. Please verify before you continue to deploy.';
              this.warningDialog('Message');
              //document.getElementById("tempDeployModalPopupWindow").click();
            }
          }

        } else {
          this.showLoadButton1 = false;
          this.GrafanashowFadeOutLoader = false;
        }
      }, err => {
        this.showLoadButton1 = false;
        this.GrafanashowFadeOutLoader = false;
        //this.logData("Error", err.error.InnerException.Message);
      });
    } else {
      this.showLoadButton1 = false;
      this.GrafanashowFadeOutLoader = false;
      this.templateInfo.GrafanatemplateName = '';
    }

  }
  public validateTemplate(evt) {
    if (!this._utility.licenseInfo.templateManagerEnabled) {
      let msgTitle = "Info";
      let msgBody = "This feature is not available in this Edition. Please contact LogicMatter at <b>support@logicmatter.com</b>";
      this._utility.warningCommonDialog(msgBody, msgTitle);
      evt.target.value = '';
      return;
    }
    this.overwriteTemplate = false;
    this.showFadeOutLoader = true;
    this.sqlFileToUpload = null;
    this.templateValidationErrors = [];
    this.userValidationMsg = '';
    if (evt.target.files.length === 0) {
      this.templateInfo.templateName = '';
      this.templateInfo.description = '';
      this.templateInfo.appName = '';
      this.templateInfo.appId = '';
      this.showFadeOutLoader = false;
      return;
    }
    else if (evt.target.files[0].name.split('.').reverse()[0] !== 'rdl') {
      this.modalHeader = "Message";
      this.modalBody = "File type must be '.rdl' (Report Definition Language) ";
      this.warningDialog('Warning');
      //document.getElementById("tempDeployModalPopupWindow").click();
      return;
    }
    this.templateInfo.appId = '';
    this.templateInfo.appName = '';
    this.templateInfo.templateName = '';
    this.templateInfo.description = '';
    this.templateInfo.templateType = '';
    this.fileToUpload = evt.target.files[0];
    const formData = new FormData();
    formData.append('tenantId', this.commonModel.tenantId);
    formData.append('templateFile', this.fileToUpload, this.fileToUpload.name);
    if (evt.target.value) {
      this._configService.validateTemplate(formData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
        this.result = resp;
        if (this.result.value == null) {

        } else {
          this.templateValidationErrors = this.result.value.validationErrors;
          this.templateInfo.appId = this.result.value.appId;
          this.templateInfo.appName = this.result.value.appName;
          this.templateInfo.templateName = this.result.value.templateName;
          this.templateInfo.description = this.result.value.description;
          this.templateInfo.templateType = this.result.value.templateType;
          this.templateInfo.reportType = this.result.value.reportType;
          this.templateInfo.templateFile = this.templateInfo.templateFile;
          this.verifyTemplateNameExists(this.templateInfo.templateName);
          //this.showFadeOutLoader = false;
        }
        //this.showFadeOutLoader = false;
        this.showLoadButton = false;
        //console.log(this.result.value);
        //console.log(this.templateValidationErrors);
      }, err => {
        this.showFadeOutLoader = false;
        this.modalHeader = "Error";
        this.modalBody = "Error occurred to validate RDL. Please see log for more details";
        this.warningDialog('Error');
        //document.getElementById("tempDeployModalPopupWindow").click();
        //this.logData("Error", err.error.InnerException.Message);
      });
    }

  }
  public validateGrafanaTemplate(evt) {
    if (!this._utility.licenseInfo.templateManagerEnabled) {
      let msgTitle = "Info";
      let msgBody = "This feature is not available in this Edition. Please contact LogicMatter at <b>support@logicmatter.com</b>";
      this._utility.warningCommonDialog(msgBody, msgTitle);
      evt.target.value = '';
      return;
    }
    this.overwriteTemplate = false;
    this.GrafanashowFadeOutLoader = true;
    this.sqlFileToUpload = null;
    this.GrafanatemplateValidationErrors = [];
    this.userValidationMsg = '';

    if (evt.target.files.length === 0) {
      this.templateInfo.GrafanatemplateName = '';
      this.templateInfo.Grafanadescription = '';
      this.templateInfo.GrafanaappName = '';
      this.templateInfo.GrafanaappId = '';
      this.GrafanashowFadeOutLoader = false;
      return;
    }
    else if (evt.target.files[0].name.split('.').reverse()[0] !== 'json') {
      this.modalHeader = "Message";
      this.modalBody = "File type must be '.json' (Report Definition Language) ";
      this.warningDialog('Warning');
      //document.getElementById("tempDeployModalPopupWindow").click();
      return;
    }

    this.fileToUpload = evt.target.files[0];
    const formData = new FormData();
    formData.append('tenantId', this.commonModel.tenantId);
    formData.append('GrafanatemplateFile', this.fileToUpload, this.fileToUpload.name);
    if (evt.target.value) {
      this._configService.validateGrafanaTemplate(formData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
        this.result = resp;
        if (this.result == null) {

        } else {
          this.GrafanatemplateValidationErrors = resp.validationErrors;
          this.templateInfo.GrafanaappId = resp.appId;
          this.templateInfo.GrafanaappName = resp.appName;
          this.templateInfo.GrafanatemplateName = resp.templateName;
          this.templateInfo.Grafanadescription = resp.description;
          this.templateInfo.GrafanatemplateType = resp.templateType;
          this.templateInfo.GrafanareportType = resp.reportType;
          this.templateInfo.GrafanatemplateFile = this.templateInfo.GrafanatemplateFile;
          this.templateInfo.GrafanardlFilePath = resp.rdlFilePath
          this.verifyGrafanatemplateNameExists(this.templateInfo.GrafanatemplateName);
          //this.showFadeOutLoader = false;
        }
        //this.showFadeOutLoader = false;
        this.showLoadButton1 = false;
        //console.log(this.result.value);
        //console.log(this.templateValidationErrors);
      }, err => {
        this.GrafanashowFadeOutLoader = false;
        this.modalHeader = "Error";
        this.modalBody = "Error occurred to validate Json. Please see log for more details";
        this.warningDialog('Error');
        //document.getElementById("tempDeployModalPopupWindow").click();
        //this.logData("Error", err.error.InnerException.Message);
      });
    }

  }
  public confirmRedeploy() {
    //this.windowsUserInfo = new WindowsUserInfo({});
    this.saveTemplate();
  }
  public cancelRedeploy() {
    //this.templateInfo.templateName = '';
    //this.templateInfo.id = '';
    this.fileToUpload = null;
    this.sqlFileToUpload = null;
    this.templateInfo = new AppTemplates();
  }
  public saveTemplate(): void {
    //this.showLoadButton = true;
    //if (this.userValidationMsg) {
    //    this.modalHeader = "Message";
    //    this.modalBody = this.userValidationMsg;
    //    document.getElementById("tempDeployModalPopupWindow").click();
    //    return;
    //} else
    if (!this._utility.licenseInfo.templateManagerEnabled) {
      let msgTitle = "Info";
      let msgBody = "This feature is not available in this Edition. Please contact LogicMatter at <b>support@logicmatter.com</b>";
      this._utility.warningCommonDialog(msgBody, msgTitle);
      return;
    }
    if (this.templateValidationErrors.length > 0) {
      this.modalHeader = "Message";
      this.modalBody = "Please upload a valid RDL";
      this.warningDialog('Message');
      //document.getElementById("tempDeployModalPopupWindow").click();
      return;
    }
    this.defaultUserForm = true;
    this.moreChoices = false;
    this.isEyeClicked = true;
    this.inputType = 'password';
    //this.windowsUserInfo = new WindowsUserInfo({});
    this.userValidationMsg = "";

    this.confirmOK();
  }

  public saveGrafanaTemplate(): void {
    //this.showLoadButton = true;
    //if (this.userValidationMsg) {
    //    this.modalHeader = "Message";
    //    this.modalBody = this.userValidationMsg;
    //    document.getElementById("tempDeployModalPopupWindow").click();
    //    return;
    //} else
    if (!this._utility.licenseInfo.templateManagerEnabled) {
      let msgTitle = "Info";
      let msgBody = "This feature is not available in this Edition. Please contact LogicMatter at <b>support@logicmatter.com</b>";
      this._utility.warningCommonDialog(msgBody, msgTitle);
      return;
    }
    if (this.GrafanatemplateValidationErrors.length > 0) {
      this.modalHeader = "Message";
      this.modalBody = "Please upload a valid RDL";
      this.warningDialog('Message');
      //document.getElementById("tempDeployModalPopupWindow").click();
      return;
    }
    this.defaultUserForm = true;
    this.moreChoices = false;
    this.isEyeClicked = true;
    this.inputType = 'password';
    //this.windowsUserInfo = new WindowsUserInfo({});
    this.userValidationMsg = "";

    this.GrafanaconfirmOK();
  }
  confirmOK(): void {
    this.isLoading = false;
    this.showLoadButton = true;
    this.userValidationMsg = "";
    {
      //this.isLoading = true;
      const formData = new FormData();
      formData.append('appId', this.templateInfo.appId);
      formData.append('appName', this.templateInfo.appName);
      formData.append('id', this.templateInfo.id);
      formData.append('templateName', this.templateInfo.templateName);
      formData.append('templatePath', this.templateInfo.templatePath);
      formData.append('templateType', this.templateInfo.templateType);
      formData.append('reportType', this.templateInfo.reportType);
      formData.append('tenantId', this.commonModel.tenantId);
      formData.append('description', this.templateInfo.description);
      formData.append('templateFile', this.fileToUpload, this.fileToUpload.name);
      formData.append('tenantInfo', JSON.stringify(this.tenantInfo));
      this._configService.deployTemplate(formData).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(resp => {
          if (resp.value) {
            this.templateValidationErrors = resp.value;
            this.templateInfo = new AppTemplates();
          } else if (resp) {
            this.modalHeader = "Success";
            this.modalBody = "Template deployed successfully";
            //document.getElementById("tempDeployModalPopupWindow").click();
            this.warningDialog('Success');
          } else {
            this.modalHeader = "Failure";
            this.modalBody = "Template deployment failed";
            //document.getElementById("tempDeployModalPopupWindow").click();
            this.warningDialog('Failed');
          }
          this.isLoading = false;
          this.showLoadButton = false;
          this.templateInfo = new AppTemplates();
        }, err => {
          this.isLoading = false;
          this.showLoadButton = false;
          this.templateInfo = new AppTemplates();
          this.modalHeader = "Failure";
          this.modalBody = "Failed to Deploy Template. Please verify Logs";
          this.warningDialog('Error');
          //document.getElementById("tempDeployModalPopupWindow").click();
        });

    }
    //});
  }

  GrafanaconfirmOK(): void {
    this.isLoading = false;
    this.showLoadButton1 = true;
    this.userValidationMsg = "";
    {
      //this.isLoading = true;
      const formData = new FormData();
      formData.append('appId', this.templateInfo.GrafanaappId);
      formData.append('appName', this.templateInfo.GrafanaappName);
      formData.append('templateName', this.templateInfo.GrafanatemplateName);
      formData.append('templatePath', this.templateInfo.GrafanatemplatePath);
      formData.append('templateType', this.templateInfo.GrafanatemplateType);
      formData.append('reportType', this.templateInfo.GrafanareportType);
      formData.append('tenantId', this.commonModel.tenantId);
      formData.append('description', this.templateInfo.Grafanadescription);
      formData.append('templateFile', this.fileToUpload, this.fileToUpload.name);
      formData.append('rdlFilePath', this.templateInfo.GrafanardlFilePath);
      formData.append('dashboardUId', this.templateInfo.GrafanadashboardUId);
      formData.append('dashboardId', this.templateInfo.GrafanadashboardId);
      formData.append('tenantInfo', JSON.stringify(this.tenantInfo));
      this._configService.deployGrafanaTemplate(formData).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(resp => {
          if (resp.value) {
            this.GrafanatemplateValidationErrors = resp.value;
            this.templateInfo = new AppTemplates();
          } else if (resp) {
            this.modalHeader = "Success";
            this.modalBody = "Template deployed successfully";
            //document.getElementById("tempDeployModalPopupWindow").click();
            this.warningDialog('Success');
          } else {
            this.modalHeader = "Failure";
            this.modalBody = "Template deployment failed";
            //document.getElementById("tempDeployModalPopupWindow").click();
            this.warningDialog('Failed');
          }
          this.isLoading = false;
          this.showLoadButton1 = false;
          this.templateInfo = new AppTemplates();
        }, err => {
          this.isLoading = false;
          this.showLoadButton1 = false;
          this.templateInfo = new AppTemplates();
          this.modalHeader = "Failure";
          this.modalBody = "Failed to Deploy Template. Please verify Logs";
          this.warningDialog('Error');
          //document.getElementById("tempDeployModalPopupWindow").click();
        });

    }
    //});
  }
  confirmationDialog() {
    const dialogRef = this.dialog.open(DeleteDialog, {
      width: "390px",
      data: { id: 0, type: '', message: this.modalBody, action: '', title: 'Confirmation' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true) {
        this.overwriteTemplate = true;
        //this.confirmRedeploy();
      } else {
        this.cancelRedeploy();
      }
    });
  }
  warningDialog(title) {
    const dialogRef = this.dialog.open(DeleteDialog, {
      width: "390px",
      data: { id: 0, type: '', message: this.modalBody, action: 'Warning', title: title }
    });
  }
  public useDefaultUser(): void {
    this.defaultUserForm = true;
    this.windowsUserInfo.password = "";
    $('#useDifferentUser').removeClass("active");
    $('#useDefaultUser').addClass("active");
  }
  public useDifferentUser(): void {
    this.defaultUserForm = false;
    this.windowsUserInfo.password = "";
    $('#useDifferentUser').addClass("active");
    $('#useDefaultUser').removeClass("active");
  }
  public moreChoiceOption(): void {
    this.moreChoices = true;
  }

  public modalCancel(): void {
    this.showLoadButton = false;
  }

  public eyeClick(): void {
    if (this.inputType === 'password') {
      this.inputType = 'text';
      this.isEyeClicked = false;
    } else {
      this.inputType = 'password';
      this.isEyeClicked = true;
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
