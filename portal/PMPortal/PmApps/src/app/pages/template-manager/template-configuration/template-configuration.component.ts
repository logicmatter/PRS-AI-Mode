import { Component, OnInit, OnDestroy } from '@angular/core';
import { TenantService } from '../../../PmCore/services/TenantService/TenantService.service';
//import { TenantList } from '../../tenant-settings/tenant-list/tenant-list';
import { TemplateConfiguration } from './template-configuration';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as $ from "jquery";
import { CommonModel } from '../../../PmModel/common.model';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialog, AppUtilService } from '../../../PmCore/shared/app-util.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UtilityService } from 'src/app/PmCore/services/utility.service';
import { ToolbarComponent } from 'src/app/layout';


//import { DatabaseSettings } from '../../tenant-settings/database-settings/database-settings';

@Component({
  selector: 'app-template-configuration',
  templateUrl: './template-configuration.component.html',
  styleUrls: ['./template-configuration.component.css']
})
export class TemplateConfigurationComponent implements OnInit, OnDestroy {
  ngUnsubscribe: Subject<void> = new Subject<void>();
  tenantList: [];
  templateConfigInfo: TemplateConfiguration;
  disableHeader = true;
  disableFooter = true;
  //databaseSettings: DatabaseSettings = new DatabaseSettings();
  public commonModel: CommonModel;
  isLoading: boolean = true;
  showLoadButton: boolean = false;
  headerImageSize: boolean = false;
  footerImageSize: boolean = false;
  headerImageType: boolean = false;
  footerImageType: boolean = false;
  headerImagePreview: string;
  footerImagePreview: string;
  footerImagePreview1: string;
  headerBgPreview: string;
  headerFgPreview: string;
  footerBgPreview: string;
  footerFgPreview: string;
  modalHeader: string;
  modalBody: string;
  result: any;
  showIfCheckboxSelected: boolean = false;
  editOption: boolean = false;
  showSQLServerError: boolean = false;
  previousTenant: string;
  userDetails: any;
   tenantLoadMessage: string='Loading..... Tenant';
  helper = new JwtHelperService();
   isAuthorized: any;
  constructor(
    public tenantService: TenantService,private _configService: TenantService, public dialog: MatDialog,private utilityService: UtilityService,
    public _utility: AppUtilService,public _toolbar: ToolbarComponent,) {
      this.userDetails = localStorage.bearerToken;
    this.isAuthorized = this.helper.decodeToken(this.userDetails);
    }

  ngOnInit() {
    this._toolbar.enablebutton();
    this.utilityService.entitySelected  = "Reports";
    this.commonModel = this._configService.currentTenantValue;
    this.templateConfigInfo = new TemplateConfiguration();
    if(this.utilityService.adhocPreviousRoute != undefined) {
      this._configService.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        tenant => {
          if (tenant === undefined) {
            return;
          } else
            if (this.commonModel.tenantName !== this.previousTenant) {
                this.isLoading=true;
              this.previousTenant = tenant.tenantName;
              this.templateConfigInfo.tenantId = tenant.tenantId
              this.getTemplateConfigInfo(this.templateConfigInfo.tenantId,'');
            }
        }, err => {
          console.log(err);
        });
      
    }
    else {
      this.getTenants();
    }
  }

  public loadEmtyTemplateConfigForm(): void {
    this.isLoading = true;
    this.templateConfigInfo.headerBackgroundColor = "#FAFAFA";
    this.templateConfigInfo.footerBackgroundColor = "#FAFAFA";
    this.templateConfigInfo.headerForegroundColor = "#282828";
    this.templateConfigInfo.footerForegroundColor = "#282828";
    this.templateConfigInfo.scheduledReportsFilePath = "";
    $('#headerImagePreview').attr('hidden', 'hidden');
    $('#footerImagePreview').attr('hidden', 'hidden');
    //$('#useSameSettingsForFooter').attr('hidden', 'hidden');
    this.headerBgPreview = "#FAFAFA";
    this.footerBgPreview = "#FAFAFA";
    this.headerFgPreview = "#282828";
    this.footerFgPreview = "#282828";
    $('#footerImageName').attr('required', 'required');
    $('#footerForegroundColor').attr('required', 'required');
    $('#footerBackgroundColor').attr('required', 'required');
    this.isLoading = false;
  }
  getTenants() {
    this._configService.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      tenant => {
        if (tenant === undefined) {
          return;
        } else
          if (this.commonModel.tenantName !== this.previousTenant) {
            this.isLoading = true;
            this.previousTenant = tenant.tenantName;
            this.templateConfigInfo.tenantId = tenant.tenantId
            this.getTemplateConfigInfo(this.templateConfigInfo.tenantId, '');
          }
      }, err => {
        console.log(err);
      });
  }
  public getTenantList(): void {

  }

  public editConfig(): void {
    if (!this._utility.licenseInfo.templateManagerEnabled) {
      let msgTitle = "Info";
      let msgBody = "This feature is not available in this Edition. Please contact LogicMatter at <b>support@logicmatter.com</b>";
      this._utility.warningCommonDialog(msgBody, msgTitle);
      return;
    }
    this.disableHeader = false;
    this.disableFooter = false;
    // $('#headerImageName').removeAttr('disabled', 'disabled');
    // $('#headerForegroundColor').removeAttr('disabled', 'disabled');
    // $('#headerBackgroundColor').removeAttr('disabled', 'disabled');

    // $('#footerImageName').removeAttr('disabled', 'disabled');
    // $('#footerForegroundColor').removeAttr('disabled', 'disabled');
    // $('#footerBackgroundColor').removeAttr('disabled', 'disabled');

    //$('#scheduledFilePath').removeAttr('disabled', 'disabled');

    if (this.templateConfigInfo.useSameSettingsForFooter) {
      this.disableFooter = true;
      // $('#footerFieldset').attr('disabled', 'disabled');
      $('#footerImageName').removeAttr('required', 'required');
      $('#footerForegroundColor').removeAttr('required', 'required');
      $('#footerBackgroundColor').removeAttr('required', 'required');
      //this.showIfCheckboxSelected = true;
      //this.footerImagePreview1 = "data:image/png;base64," + resp[0].footerImageBase64;
      //$('#useSameSettingsForFooter').removeAttr('hidden');
    }
    this.editOption = true;
  }

  public cancelEdit(): void {
    this.disableHeader = true;
    this.disableFooter = true;
    $('#headerFieldset').attr('disabled', 'disabled');
    $('#footerFieldset').attr('disabled', 'disabled');
    $('#headerImageName').attr('disabled', 'disabled');
    $('#headerForegroundColor').attr('disabled', 'disabled');
    $('#headerBackgroundColor').attr('disabled', 'disabled');

    $('#footerImageName').attr('disabled', 'disabled');
    $('#footerForegroundColor').attr('disabled', 'disabled');
    $('#footerBackgroundColor').attr('disabled', 'disabled');
    this.editOption = false;
    this.getTemplateConfigInfo(this.templateConfigInfo.tenantId, this.templateConfigInfo.tenantName);
  }

  public onClickHeader(): void {
    //$('#headerImagePreview').attr('hidden', 'hidden');
    //$('#useSameSettingsForFooter').attr('hidden', 'hidden');
    this.headerImageSize = false;
    this.headerImageType = false;
  }

  public onClickFooter(): void {
    //$('#footerImagePreview').attr('hidden', 'hidden');
    this.footerImageSize = false;
    this.footerImageType = false;
  }

  public changeImageOnchange(event: any) {
    $("#lblHeaderImageName").addClass("selected").html(event.target.files[0].name);
  }

  public headerFileInputOnchange(fileInput: any): void {
    this.templateConfigInfo.headerImage = fileInput.target.files[0];
    $("#lblHeaderImageName").addClass("selected").html(fileInput.target.files[0].name);
    if (fileInput.target.files && fileInput.target.files[0]) {
      var file = fileInput.target.files[0];
      if (file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase() !== 'png') {
        this.headerImageType = true;
        fileInput.target.value = '';
      } else if (file.size > 1048576) {
        this.headerImageSize = true;
        fileInput.target.value = '';
      } else {
        var reader = new FileReader();
        let angularThis = this;
        reader.onload = function (e: any) {
          angularThis.headerImagePreview = e.target.result;
          $('#headerImagePreview').removeAttr('hidden');
          //$('#useSameSettingsForFooter').removeAttr('hidden');
          if (angularThis.templateConfigInfo.useSameSettingsForFooter) {
            angularThis.footerImagePreview1 = e.target.result;
            angularThis.footerImagePreview = e.target.result;
            $('#footerImagePreview1').removeAttr('hidden');
            angularThis.templateConfigInfo.footerImage = fileInput.target.files[0];
          }
          //$('#headerImagePreview').attr('src', e.target.result);
        }
        reader.readAsDataURL(file);
      }
    }
  }

  public useSameSettingsForFooterOnChange(event: any): void {
    if (event.target.checked) {
      this.templateConfigInfo.footerImage = this.templateConfigInfo.headerImage;
      this.footerImagePreview1 = this.headerImagePreview;
      this.footerImagePreview = this.headerImagePreview;
      this.footerFgPreview = this.headerFgPreview;
      this.footerBgPreview = this.headerBgPreview;
      this.templateConfigInfo.footerForegroundColor = this.templateConfigInfo.headerForegroundColor;
      this.templateConfigInfo.footerBackgroundColor = this.templateConfigInfo.headerBackgroundColor;
      $('#footerImageName').removeAttr('required');
      $('#footerForegroundColor').removeAttr('required');
      $('#footerBackgroundColor').removeAttr('required');
      $('#footerFieldset').attr('disabled', 'disabled');
      $('#footerImagePreview').removeAttr('hidden');
    } else {
      this.templateConfigInfo.footerImage = null;
      this.footerImagePreview = "data:image/png;base64," + this.result[0].footerImageBase64;
      this.footerImagePreview1 = null;
      this.footerFgPreview = this.result[0].footerForegroundColor.toUpperCase();
      this.footerBgPreview = this.result[0].footerBackgroundColor.toUpperCase();
      this.templateConfigInfo.footerForegroundColor = this.result[0].footerForegroundColor;
      this.templateConfigInfo.footerBackgroundColor = this.result[0].footerBackgroundColor;

      $('#footerFieldset').removeAttr('disabled', 'disabled');
      $('#footerForegroundColor').attr('required', 'required');
      $('#footerBackgroundColor').attr('required', 'required');
    }
  }

  public footerFileInputOnchange(fileInput: any): void {
    this.templateConfigInfo.footerImage = fileInput.target.files[0];
    if (fileInput.target.files && fileInput.target.files[0]) {
      var file = fileInput.target.files[0];
      if (file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase() !== 'png') {
        this.footerImageType = true;
        fileInput.target.value = '';
      } else if (file.size > 1048576) {
        this.footerImageSize = true;
        fileInput.target.value = '';
      } else {
        var reader = new FileReader();
        let angularThis = this;
        reader.onload = function (e: any) {
          angularThis.footerImagePreview = e.target.result;
          $('#footerImagePreview').removeAttr('hidden');
          //$('#footerImagePreview').attr('src', e.target.result);
        }
        reader.readAsDataURL(file);
      }
    }
  }

  public headerBgColorInputOnchange(): void {
    this.headerBgPreview = this.templateConfigInfo.headerBackgroundColor.toUpperCase();
    if (this.templateConfigInfo.useSameSettingsForFooter) {
      this.footerBgPreview = this.headerBgPreview;
      this.templateConfigInfo.footerBackgroundColor = this.templateConfigInfo.headerBackgroundColor;
    }
  }

  public footerBgColorInputOnchange(): void {
    this.footerBgPreview = this.templateConfigInfo.footerBackgroundColor.toUpperCase();
  }

  public headerFgColorInputOnchange(): void {
    this.headerFgPreview = this.templateConfigInfo.headerForegroundColor.toUpperCase();
    if (this.templateConfigInfo.useSameSettingsForFooter) {
      this.footerFgPreview = this.headerFgPreview;
      this.templateConfigInfo.footerForegroundColor = this.templateConfigInfo.headerForegroundColor;
    }
  }

  public footerFgColorInputOnchange(): void {
    this.footerFgPreview = this.templateConfigInfo.footerForegroundColor.toUpperCase();
  }

  public submitTemplateConfigForm(): void {
    if (!this._utility.licenseInfo.templateManagerEnabled) {
      let msgTitle = "Info";
      let msgBody = "This feature is not available in this Edition. Please contact LogicMatter at <b>support@logicmatter.com</b>";
      this._utility.warningCommonDialog(msgBody, msgTitle);
      return;
    }
    this.showLoadButton = true;
    // This is the URL path so that I'm sending through model
    //this.databaseSettings.repJobLocation = this.templateConfigInfo.scheduledReportsFilePath;
    //this._configService.checkPathExistOrNot("").subscribe(resp => {
    //  if (resp) {
    let tempConfigFormData = new FormData();
    tempConfigFormData.append("tenantId", this.templateConfigInfo.tenantId);
    //const result = this.tenantList.find(({ id }) => id === this.templateConfigInfo.tenantId);
    tempConfigFormData.append("tenantName", "");
    if (this.templateConfigInfo.useSameSettingsForFooter) {
      tempConfigFormData.append('footerImage', this.templateConfigInfo.headerImage);
      tempConfigFormData.append("footerBackgroundColor", this.templateConfigInfo.headerBackgroundColor);
      tempConfigFormData.append("footerForegroundColor", this.templateConfigInfo.headerForegroundColor);
    } else {
      tempConfigFormData.append('footerImage', this.templateConfigInfo.footerImage);
      tempConfigFormData.append("footerBackgroundColor", this.templateConfigInfo.footerBackgroundColor);
      tempConfigFormData.append("footerForegroundColor", this.templateConfigInfo.footerForegroundColor);
    }
    tempConfigFormData.append('headerImageBase64', this.templateConfigInfo.headerImageBase64);
    tempConfigFormData.append('headerImageType', this.templateConfigInfo.headerImageType);
    tempConfigFormData.append('footerImageBase64', this.templateConfigInfo.footerImageBase64);
    tempConfigFormData.append('footerImageType', this.templateConfigInfo.footerImageType);
    tempConfigFormData.append('headerImage', this.templateConfigInfo.headerImage);
    tempConfigFormData.append("headerBackgroundColor", this.templateConfigInfo.headerBackgroundColor);
    tempConfigFormData.append("headerForegroundColor", this.templateConfigInfo.headerForegroundColor);
    tempConfigFormData.append("scheduledReportsFilePath", this.templateConfigInfo.scheduledReportsFilePath);
    tempConfigFormData.append("useSameSettingsForFooter", this.templateConfigInfo.useSameSettingsForFooter.toString());
    this._configService.saveTemplateConfiguration(tempConfigFormData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      if (resp) {
        this.modalHeader = "Success";
        this.modalBody = "Template configuration saved successfully";
        this.warningDialog('Success');
        //document.getElementById("tempConfigModalPopupWindow").click();
        this.getTemplateConfigInfo(this.templateConfigInfo.tenantId, "");
        this.editOption = false;
      } else {
        this.modalHeader = "Failure";
        this.modalBody = "Saving the Template configuration is failed";
        this.warningDialog('Failure');
        //document.getElementById("tempConfigModalPopupWindow").click();
      }
      this.showLoadButton = false;
    });
    //} else {
    //    this.modalHeader = "Failure";
    //    this.modalBody = "Given Scheduled files location path doesn't exists";
    //    document.getElementById("tempConfigModalPopupWindow").click();
    //    this.showLoadButton = false;
    //}
    //});
  }

  //public onChangeTenant(event: { target: { value: string; }; }): void {
  //    const result = this.tenantList.find(({ id }) => id === event.target.value);
  //    this.templateConfigInfo.tenantId = result.id;
  //    this.templateConfigInfo.tenantName = result.tenantName;
  //    this.getTemplateConfigInfo(result.id, result.tenantName);
  //}

  public getTemplateConfigInfo(selectedTenantId: string, selectedTenantName: string): void {
    this.isLoading = true;
    this.editOption = false;
    this._configService.getTemplateConfiguration(selectedTenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      this.result = resp;
      if (this.result == null) {
        this.loadEmtyTemplateConfigForm();
      } else if (this.result.length != 0) {
        this.templateConfigInfo.headerImageBase64 = resp[0].headerImageBase64;
        this.templateConfigInfo.footerImageBase64 = resp[0].footerImageBase64;
        this.templateConfigInfo.headerImageType = resp[0].headerImageType;
        this.templateConfigInfo.footerImageType = resp[0].footerImageType;
        this.headerImagePreview = "data:image/png;base64," + resp[0].headerImageBase64;
        this.footerImagePreview = "data:image/png;base64," + resp[0].footerImageBase64;
        //this.templateConfigInfo.
        this.templateConfigInfo.headerBackgroundColor = resp[0].headerBackgroundColor;
        this.templateConfigInfo.headerForegroundColor = resp[0].headerForegroundColor;
        this.templateConfigInfo.footerBackgroundColor = resp[0].footerBackgroundColor;
        this.templateConfigInfo.footerForegroundColor = resp[0].footerForegroundColor;
        this.templateConfigInfo.scheduledReportsFilePath = resp[0].scheduledReportsFilePath;
        this.templateConfigInfo.useSameSettingsForFooter = resp[0].useSameSettingsForFooter;
        this.headerBgPreview = resp[0].headerBackgroundColor.toUpperCase();
        this.footerBgPreview = resp[0].footerBackgroundColor.toUpperCase();
        this.headerFgPreview = resp[0].headerForegroundColor.toUpperCase();
        this.footerFgPreview = resp[0].footerForegroundColor.toUpperCase();
        $('#headerImagePreview').removeAttr('hidden');
        $('#footerImagePreview').removeAttr('hidden');
        this.disableHeader = true;
        this.disableFooter = true;
        $('#scheduledFilePath').attr('disabled', 'disabled');
        this.isLoading = false;
      } else {
        this.loadEmtyTemplateConfigForm();
      }
      //this.modalHeader = "Success";
      //this.modalBody = "Template configuration details loaded successfully";
      //document.getElementById("tempConfigModalPopupWindow").click();
    });
  }

  public changeHeaderImage(fileInput: any): void {
    this.templateConfigInfo.headerImage = fileInput.target.files[0];
    $("#lblHeaderImageName").addClass("selected").html(fileInput.target.files[0].name);
    if (fileInput.target.files && fileInput.target.files[0]) {
      var file = fileInput.target.files[0];
      if (file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase() !== 'png') {
        this.headerImageType = true;
        fileInput.target.value = '';
      } else if (file.size > 1048576) {
        this.headerImageSize = true;
        fileInput.target.value = '';
      } else {
        var reader = new FileReader();
        let angularThis = this;
        reader.onload = function (e: any) {
          angularThis.headerImagePreview = e.target.result;
          $('#headerImagePreview').removeAttr('hidden');
          //$('#useSameSettingsForFooter').removeAttr('hidden');
          if (angularThis.templateConfigInfo.useSameSettingsForFooter) {
            angularThis.footerImagePreview1 = e.target.result;
            $('#footerImagePreview1').removeAttr('hidden');
            angularThis.templateConfigInfo.footerImage = fileInput.target.files[0];
          }
          //$('#headerImagePreview').attr('src', e.target.result);
        }
        reader.readAsDataURL(file);
      }
    }
  }

  public changeFooterImage(fileInput: any): void {
    this.templateConfigInfo.footerImage = fileInput.target.files[0];
    if (fileInput.target.files && fileInput.target.files[0]) {
      var file = fileInput.target.files[0];
      if (file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase() !== 'png') {
        this.footerImageType = true;
        fileInput.target.value = '';
      } else if (file.size > 1048576) {
        this.footerImageSize = true;
        fileInput.target.value = '';
      } else {
        var reader = new FileReader();
        let angularThis = this;
        reader.onload = function (e: any) {
          angularThis.footerImagePreview = e.target.result;
          $('#footerImagePreview').removeAttr('hidden');
          //$('#footerImagePreview').attr('src', e.target.result);
        }
        reader.readAsDataURL(file);
      }
    }
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