import { AbstractControl, FormGroup } from '@angular/forms';
import { Injectable, Component, Inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription, timer, Subject } from 'rxjs';
import { Facet } from 'src/app/PmModel/facet';
import { Complianceprofile}  from 'src/app/PmModel/complianceprofile.model';

import { EnvLocObj } from 'src/app/PmModel/EnvLocObj';
import { ReportObj } from 'src/app/PmModel/ReportObj';
import { StandardObj } from 'src/app/PmModel/StandardObj';
import { EqpLocObj } from 'src/app/PmModel/EqpLocObj';
import { ReportingService, UserService, AppService, TenantService } from '../services';
import * as $ from 'jquery';
import { RoleguardService } from 'src/app/guards/roleguard.service';
import { TimeoutService } from '../services/timeout.service';
import { Router } from '@angular/router';
import { CoreUtilityService } from './core-utility.service';
import { LookupServiceService } from 'src/app/PmCore/services/LookupService/lookup-service.service';
import { CommonDateModel } from 'src/app/PmModel/common-date.model';
import { AdhocReportutilityService } from 'projects/AppAdhoc/src/app/adhoc-reportutility.service';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const BASE_API_URL = environment.apiUrl;
const API_URL = `${BASE_API_URL}/AppsManager/`;
// const API_URL = 'api/AppsManager/';


@Injectable({
  providedIn: 'root'
})
export class AppUtilService implements OnDestroy {
  newReport: boolean;
  classType: string;
  isUpdate: boolean;
  isbreadEditReport: boolean;
  saveDisable: boolean = true;
  isValidValue: boolean;
  intPattern = new RegExp('^(0|\-?[1-9,-][0-9,-]*)$');
  fltPattern = new RegExp('^[0-9.0-9,-]*$');
  ngUnsubscribe: Subject<void> = new Subject<void>();
  saveFilter: any;
  public licenseInfo = {
    'version': '',
    'type': '',
    'isLimitedEdition': false,
    'isServer' : false,
    'reportLimit': 0,
    'objectLimit': 0,
    'templateManagerEnabled': false,
    'reportScheduleEnabled': false,
    'emailEnabled': false,
    'customizationEnabled': false,
    'productFeatures' : [],
    'isGrafanaInstalled': false,
  };
  previousTenant: string;
  validType: boolean;
  lic: any;
  isEmptyValue: boolean = false;
  reportFormat: any;
  isEnableResolution: any;
  isEnableAggregation: any;
  isUserIdRequiredForTemplate = false;
  isTenantNameRequiredForTemplate = false;
  isBatchIdRequiredForTemplate = false;
  standard: any;
  selectedSIDsItems: any;
  selectedItemSids: any;
  tenantId: any;
  dummy: boolean;
  HomeSelecttenant: any;
  isGrafana: boolean = false;
  isObjectGrafana: boolean = false;
  isGrafanareset: boolean = false;
  isGrafanaedit: boolean = false;
  Grafanaurl;
  grafanabase;
  reg: string;
  isFacet: boolean = false;
  iscompilanceprofile: boolean = false;
  isStandard: boolean = false;
  isLocation: boolean = false;
  distinctLocationObj: any;
  pmanalyticmode: boolean = false;
  viewobjname: string;
  distinctprofileObj: any;
  compprofileedit: boolean = false;
  importerdatasource: boolean = false;
  Transformerdatasource: string;
  isTableHasDatasource: boolean = false;
  selectedObjectType: string;
  constructor(
    private http: HttpClient,
    public _rptService: ReportingService,
    public _configure: LookupServiceService,
    public _appService: AppService,
    public roleGaurd: RoleguardService,
    public _core: CoreUtilityService,
    private tenantService: TenantService,
    public _Adhocutility: AdhocReportutilityService,
    public toastr: ToastrService,
    public dialog: MatDialog,
    @Inject('BASE_URL') private baseUrl: string
  ) {
    this.commonDateModel = this.tenantService.currentDateValue;
    this.tenantService.getLicenseInfo().pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      this.licenseInfo.version = resp.version;
      this.licenseInfo.type = resp.type;
      this.licenseInfo.objectLimit = resp.objectLimit;
      this.licenseInfo = resp;
      this.licenseInfo.productFeatures = resp.productFeatures
      this.lic = resp.domain
    }, err => {
      this.toastr.error("Failed to get license info");
    });
  }
  public commonDateModel: CommonDateModel;
  dropdownList = [];
  selectedItems: any;
  datesValidator: boolean;
  hasSelectedBacknetObject = false;
  hasReportNameValid: boolean;
  isReportNameEmpty: boolean;
  validReportForm: boolean = false;
  validTemplateForm: boolean = false;
  validReportParams: boolean = false;
  isObjectSelectionEnable: boolean;
  resolution: string;
  appType: string;
  csvDownloadFlag: boolean = false;
  initialState: boolean = false;
  isReportRun: boolean = false;
  public facetObject: Facet = new Facet();
  public standardObject: StandardObj = new StandardObj();
  public locationObject: EnvLocObj = new EnvLocObj();
  public eqpLocationObject: EqpLocObj = new EqpLocObj();
  public profileObject: Complianceprofile = new Complianceprofile();
  public reportObjUtil: ReportObj = new ReportObj();
  showFacetBack: boolean = false;
  showStandardBack: boolean = false;
  showLocationBack: boolean = false;
  showCompilanceprofileBack : boolean = false;
  showConfigure: boolean = false;
  showReportList: boolean = false;
  showCreateReport: boolean = false;
  isConfigure: boolean = false;
  isReportList: boolean = false;
  isCreateReport: boolean = false;
  toggle: boolean = false;
  isClickedToggle: boolean = false;
  mainWidthToggle: boolean = false;
  templatePath: string;
  templateName: string;
  templateURL: string;
  appName: string = '';
  normalizedAppName: string = '';
  templateObjects: any = [];
  rptParamValues: any = {};
  reportID: any;
  reportData: any;
  showFacet = false;
  showStandard = false;
  showLocation = false;
  showcompilanceprofile = false;
  showSpinner: boolean = false;
  reportNameExists: boolean = false;
  reportsList = [];
  rptObj: any;
  createRpt: boolean = false;
  closeDialog: boolean = false;
  isObjectSelection: boolean = false;
  ignoredPrompts = [
    "rid",
    "sdt",
    "edt",
    "sdr",
    "lid",
    "eid",
    "asid",
    "tsid",
    "esid",
    "dr",
    "agr",
    "csvDump",
    "res",
    "bt",
    "uid",
    "tap",
    "tn",
    'rsid'
  ];
  StandardHeader = [
    "Standard ID",
    "Rule Code",
    "Regulation",
    "Facet",
    "Facet Value",
    "Criteria",
    "Acceptable Low",
    "Acceptable High"
  ];
  LocationHeader = [
    "Site",
    "Location",
    "Point Type",
    "Add Objects",
    "Standard ID",
    "Facet",
    "Facet Value"
  ];
  tenants: any = [];
  Dtenant: any = [];
  currentPage = 1;
  nextPage;
  previousPage;
  Transpage;
  toPage;
  totalNoPages;
  isRunFeatures: boolean;
  templateID: string;
  hasChild: boolean;
  hasPreview: boolean;
  rptTempParamValues: any;
  action: string;
  url = "api/ReportManager/getTemplateParameterListAsync";
  locLogDevNum: any;
  locObjName: any;
  locMeterName: any;
  locLogDescription: any;
  locDescription: any;
  locRateDevInst: any;
  locObjInst: any;
  locStandardID: any;
  locRuleCode: any;
  locRegulation: any;
  locFacet: any;
  locfacetUnit: any;
  locInst: any;
  appID;
  tenantID: string;
  rType: string;
  userID;
  configedit: boolean = false;
  itemcrenvedit: boolean =false;
  userName: string;
  canEdit: boolean = true;
  btnLoading: boolean = false;
  globalDr: string;
  globalSDT: Date;
  globalEDT: Date;
  shouldDisplayDivs: boolean = false;
  APPTYPE = ["alarmDashboard", "trendlogDashboard", "energylogDashboard"];
  reportNamePattern = /^[a-zA-Z0-9_!@$%^\- ]*$/g;
  validatorTemplateForm(
    dynamicForm: AbstractControl,
    form: AbstractControl,
    drForm: FormGroup
  ) {
    if (
      dynamicForm.valid &&
      form.valid &&
      drForm.valid &&
      this.hasSelectedBacknetObject &&
      !this.datesValidator
    ) {
      if (drForm.contains("dr")) {
        if (drForm.value.dr === "custom") {
          if (drForm.value.startDate === null || drForm.value.endDate === null) {
            this.validTemplateForm = false;
          } else {
            this.validTemplateForm = true;
          }
        } else {
          this.validTemplateForm = true;
        }
      }
    } else {
      this.validTemplateForm = false;
    }
  }

  checkMultiValidation(value, params) {
    let tempVal = value.trim();
    this.isEmptyValue = false;
    if (tempVal != '') {
      if (params.parameterTypeName === 'Integer') {
        if (tempVal) {
          this.validType = this.intPattern.test(value);
          if (!this.validType) {
            this.validType = true;
            this.validTemplateForm = false;
          }
          else {
            this.validType = false;
            if (this.validTemplateForm) {
              this.validTemplateForm = true;
            }
            else {
              this.validTemplateForm = false;
            }
          }
        } else {
          this.isEmptyValue = true;
          this.validTemplateForm = false;
        }
      }
      if (params.parameterTypeName === 'Float') {
        if (tempVal) {
          this.validType = this.fltPattern.test(value);
          if (!this.validType) {
            this.validType = true;
            this.validTemplateForm = false;
          }
          else {
            this.validType = false;
            if (this.validTemplateForm) {
              this.validTemplateForm = true;
            }
            else {
              this.validTemplateForm = false;
            }
          }
        } else {
          this.isEmptyValue = true;
          this.validTemplateForm = false;
        }
      }
    }
    else {
      this.isEmptyValue = true;
      this.validTemplateForm = false;
    }

  }
  validatorTemplateForm1() {
    if (this.validTemplateForm) {
      this.validTemplateForm = true;
    }
  }
  setPage() {
    this.currentPage = 1;
    let d = this.reportData;
    ////console.log(d);
    let da = new DOMParser();
    let p = da.parseFromString(d, "text/html");
    let pageNum = p.querySelector("[TITLE='page_number']");
    if (pageNum !== null) {
      ////console.log(pageNum);
      if (pageNum.textContent.match(/\d+/g)) {
        let pages: number[] = pageNum.textContent.match(/\d+/g).map(Number);
        ////console.log(pages);
        this.currentPage = pages[0];
        this.totalNoPages = pages[1];
      } else { this.totalNoPages = 1; }
    } else {
      this.totalNoPages = 1;
    }
  }
  openNav() {
    this.toggle = !this.toggle;
    if (this.toggle) {
      this.isClickedToggle = true;
      this.mainWidthToggle = true;
    } else {
      this.isClickedToggle = false;
      this.mainWidthToggle = false;
    }
  }

  getAppTemplates(tenantId: string, appID: string): Observable<any> {
    return this.http.get<any>(API_URL + "GetAppTemplates/", {
      params: { 'appID': appID, 'tenantId': tenantId }
    });
  }
  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }
  preCalculatedDate(dateRange: string) { }
  changeGeneratorImgHeight(d: string) {
    let da = new DOMParser();
    let p = da.parseFromString(d, "text/html");
    let imgContainer = p.querySelector("[class=' resize100Height']");
    try {
      if (imgContainer.hasAttribute("style")) {
        imgContainer.removeAttribute("style");
        if (imgContainer != null) {
          let imgElement = imgContainer.querySelector(
            "[class='resize100Width resize100Height']"
          );
          imgElement.setAttribute(
            "style",
            "width:350px;height:256px;opacity:1;"
          );
          //this.reportData = p.documentElement.outerHTML;
        }
      }
      return p.documentElement.outerHTML;
    } catch (err) {
      return d;
    }
  }
  warningCommonDialog(messageBody, messageTitle) {
    const dialogRef = this.dialog.open(DeleteDialog, {
      width: "390px",
      data: { id: 0, type: '', message: messageBody, action: 'Warning', title: messageTitle }
    });
  }
  reportClick() {
    let self = this;
    $(document).ready(function () {
      $("#report #oReportDiv a").bind("click", e => {
        if (e.currentTarget.href.indexOf("javascript") > -1) {
          e.preventDefault();
          self.rptParamValues.Section = 1;
          self.getParentReport();
          self.hasChild = false;
          return;
        }
        var ahref = e.currentTarget.href.split("?");
        // On SSRS error - handle report URL
        if (ahref[1].indexOf("LinkId") == -1) {
          e.preventDefault();
          self.hasChild = true;
          self.rptParamValues.Section = 1;
          //self.hasChild = true;
          // if (
          //   self.appType === "trendlogDashboard" ||
          //   self.appType === "energylogDashboard"
          // ) {
          //   self.hasPreview = true;
          //   //self.hasChild = true;
          // }

          self.reportObjUtil.RptPath = ahref[1];
          if (self.hasPreview) {
            self.rptTempParamValues = self.rptParamValues;
          } else {
            self.rptParamValues = {
              RptPath: self.templateID,
              Section: 1,
              sdt: self._core.convert(self.commonDateModel.startDate),
              edt: self._core.convert(self.commonDateModel.endDate),
              tn: self.reportObjUtil.TenantId
            };
          }

          // self.rptObj.rptPath =
          self.getChildReport();
        }
      });
    });
  }
  getChildReport() {
    this.reportData = "";
    this.showSpinner = true;
    this.reportObjUtil.ReportParams = JSON.stringify(this.rptParamValues);
    this.reportObjUtil.TenantId = this.tenantID;
    this.reportObjUtil.ReportFormat = this.reportFormat;
    this.reportObjUtil.HasChild = true;

    this._rptService
      .runReport(
        this.reportObjUtil
      ).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        this.reportData = data;
        this.reportClick();
        this.setPage();
        this.showSpinner = false;
        //this.setPage();
      });
  }
  // getPRSConfig(): Observable<any> {
  //   return this.http.get<any>()
  // }
  getParentReport() {
    this.reportData = "";
    if (this.hasPreview) {
      this.rptParamValues = this.rptTempParamValues;
    } else {
      this.reportObjUtil.Id = this.reportID;
    }

    this.reportObjUtil.RptPath = "";
    this.showSpinner = true;
    this.reportObjUtil.ReportParams = JSON.stringify(this.rptParamValues);
    this.reportObjUtil.TenantId = this.tenantID;
    this.reportObjUtil.ReportFormat = this.reportFormat;
    this.reportObjUtil.HasChild = false;
    this._rptService
      .runReport(
        this.reportObjUtil
      ).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        this.reportData = data;
        this.reportClick();
        this.setPage();
        this.showSpinner = false;
        //this.setPage();
      });
  }
  reportTime() {
    //DateTime - yyyyddMMHHmmss used for report download
    var dt = new Date();
    var reportTime = dt.getFullYear() + this.padZero(dt.getMonth() + 1) + this.padZero(dt.getDate()) + dt.getHours() + dt.getMinutes() + dt.getSeconds().toString();
    return reportTime;
  }
  padZero(number) {
    return (number < 10 ? '0' : '') + number;
  }
  public validateAppAccess(appId): boolean {
    let isActive = false;
    this._appService.getAppInfo(appId).subscribe((resp) => {
      if (resp) {
        isActive = resp.isActive;
        return isActive;
      } else {
        return false;
      }
    }, err => {
      return false;
    });
    return isActive;
  }
  hasEditPermission(reportObj: any) {
    if (
      this.roleGaurd.isAuthenticate.roles === "User" &&
      this.roleGaurd.isAuthenticate.sub === reportObj.createdBy
    ) {
      return true;
    } else if (
      this.roleGaurd.isAuthenticate.roles === "Manager" ||
      this.roleGaurd.isAuthenticate.roles === "Admin"
    ) {
      return true;
    }
    return false;
  }
  validateStandardID(standardID: any): boolean {
    const regex = /^[a-zA-Z0-9_.#!@$%^:/\- ]*$/g;
    let result = regex.test(standardID);
    return result;
  }
  validateAcceptablLowandHigh(standardID: any): boolean {
    const regex = /^(-[0-9]|[0-9])+([.][0-9]+)?$/g;
    let result = regex.test(standardID);
    return result;
  }
  validateStandardCriteria(
    criteria: string,
    accLow?: string,
    accHigh?: string
  ): string {
    let errorMsg = "";
    if (criteria === "IsBetween" || criteria === "IsNotInBetween") {
      if (Number(accLow) > Number(accHigh)) {
        errorMsg = "Acceptable Low should not greater than Acceptable High";
      }
    }
    return errorMsg;
  }
  // public getJson() {
  //   return this.http.get("../../../assets/files/durationMapper.json");
  // }
  getDefaultReportResolution(
    duration: string,
    startDate?: Date,
    endDate?: Date
  ) {
    switch (duration.toLowerCase()) {
      case "today": {
        this.resolution = "actual";
        break;
      }
      case "_24HRS": {
        this.resolution = "actual";
        break;
      }
      case "yesterday":
      case "day": {
        this.resolution = "hourly";
        break;
      }
      case "currentweek":
      case "WTD": {
        this.resolution = "daily";
        break;
      }
      case "lastweek":
      case "week": {
        this.resolution = "daily";
        break;
      }
      case "currentmonth":
      case "mtd": {
        this.resolution = "daily";
        break;
      }
      case "lastmonth":
      case "month": {
        this.resolution = "daily";
        break;
      }
      case "currentquarter":
      case "qtd":
      case "_1q":
      case "_2q":
      case "_3q":
      case "_4q":
      case "lastyear1q":
      case "lastyear2q":
      case "lastyear3q":
      case "lastyear4q": {
        this.resolution = "weekly";
        break;
      }
      case "lastquarter":
      case "ytd": {
        this.resolution = "weekly";
        break;
      }
      case "currentyear":
      case "_1y":
      case "year": {
        this.resolution = "monthly";
        break;
      }
      case "lastyear":
      case "_2y": {
        this.resolution = "monthly";
        break;
      }
      case "last 7":
        this.resolution = "daily";
        break;
      case "last 30":
        this.resolution = "daily";
        break;
      case "last 90":
        this.resolution = "weekly";
        break;
      case "custom": {
        let nod = this.getDateDifference(startDate, endDate);
        this.getCustomResolution(nod);
        break;
      }
      default: {
        //statements;
        // this.resolution = "custom";
        break;
      }
    }
  }
  getDateDifference(startDate: Date, endDate: Date): number {
    // var d1 = new Date(this._utility.reportParams.startDate);
    // var d2 = new Date(this._utility.reportParams.endDate);
    var timeDiff = endDate.getTime() - startDate.getTime();
    var DaysDiff = timeDiff / (1000 * 3600 * 24);
    if (DaysDiff < 1) {
      return DaysDiff;
    } else {
      return Math.round(DaysDiff);
    }

  }
  getCustomResolution(numberOfDay: number) {
    if (numberOfDay < 1) {
      this.resolution = "actual";
    } else if (numberOfDay == 1) {
      this.resolution = "hourly";
    } else if (numberOfDay > 1 && numberOfDay < 90) {
      this.resolution = "daily";
    }
    // else if(numberOfDay >30 && numberOfDay <90){
    //   this.resolution = "daily";
    // }
    else if (numberOfDay >= 90 && numberOfDay < 365) {
      this.resolution = "weekly";
    } else {
      this.resolution = "monthly";
    }
  }

  validateReportName(reportName: string): boolean {
    const regex = /^[a-zA-Z0-9_!@$%^\- ]*$/g;
    let result = regex.test(reportName);
    return !result;
  }

  //it takes object type and set object list to dropdownList variable
  getSelectObjectsList(objectType: string): any {
    let objectsList = [];
    if (objectType.trim() === '') {
      return null;
    }
    else if (objectType.toLowerCase().trim() === 'alarm') {
      objectsList = this.getObjects(objectType);
    }
    else if (objectType.toLowerCase().trim() === 'trendlog') {
      objectsList = this.getObjects(objectType);
    }
    else if (objectType.toLowerCase().trim() === 'energy') {
      objectsList = this.getObjects(objectType);
    }
    else if (objectType.toLowerCase().trim() === 'lid') {
      objectsList = this.getLocationsObject();
    }
    else if (objectType.toLowerCase().trim() === 'eid') {
      objectsList = this.getEquipmentObjects();
    }
    return objectsList;
  }

  getObjects(objectType: string): any {
    this.dropdownList = [];
    this._rptService.getPointSID(objectType, this.tenantID).subscribe(
      data => {
        let objList: any;
        objList = data;
        if (objectType.toLowerCase() === 'energy') {
          objList.forEach(element => {
            this.dropdownList.push({
              id: element["sid"],
              itemName:
                element["logDescription"]
            });
          });
        } else {
          objList.forEach(element => {
            this.dropdownList.push({
              id: element["sid"],
              itemName:
                element["logDevNum"] +
                " - " +
                element["objName"] +
                " - " +
                element["logDescription"]
            });
          });
        }

      },
      error => {
      }
    );
    return this.dropdownList;
  }

  getLocationsObject(): any {
    this.dropdownList = [];
    this._configure
      .getCriticalLocationsList("true", this.tenantID)
      .subscribe(
        data => {
          let locations: any;
          locations = data;
          locations.forEach(element => {
            this.dropdownList.push({
              id: element["sid"],
              itemName: element["roomName"]
            });
          });
        },
        error => {
        }
      );
    return this.dropdownList;
  }
  getEquipmentObjects(): any {
    this.dropdownList = [];
    this._configure
      .getCriticalEquipmentsList("true", this.tenantID)
      .subscribe(
        data => {
          let locations: any;
          locations = data;
          locations.forEach(element => {
            this.dropdownList.push({
              id: element["sid"],
              itemName: element["equipmentName"]
            });
          });
        },
        error => {
        }
      );
    return this.dropdownList;
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}// end of the class
export interface DialogData {
  id;
  type;
  message: string;
  action: string;
  title: string;
  counter: number;
}
@Component({
  selector: "delete-dialog",
  templateUrl: 'dialog.html'
})

export class DeleteDialog {
  dialogContentMessage: string = "Are you sure, you want to delete?";
  public _counter: number = 15;
  public _status: string = "Initialized.";
  private _timer: Observable<number>;
  public status = false;
  constructor(
    public dialogRef: MatDialogRef<DeleteDialog>,
    public userService: UserService,
    private router: Router,
    public coreUtility: CoreUtilityService,
    public idleTimeoutSvc: TimeoutService,
    @Inject('BASE_URL') private baseUrl: string,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.dialogContentMessage = data.message;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }




}
