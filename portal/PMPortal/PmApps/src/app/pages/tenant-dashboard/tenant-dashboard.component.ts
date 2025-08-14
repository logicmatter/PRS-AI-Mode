import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import { Subject, of } from "rxjs";
import { takeUntil, skip, concatMap } from "rxjs/operators";
import { ReportingService, TenantService } from "src/app/PmCore/services";
import { UtilityService } from "src/app/PmCore/services/utility.service";
import { AppUtilService } from "src/app/PmCore/shared/app-util.service";
import { CoreUtilityService } from "src/app/PmCore/shared/core-utility.service";
import { ReportHelper } from "src/app/PmCore/shared/report-helper";
import { ReportObj } from "src/app/PmModel/ReportObj";
import { CommonDateModel } from "src/app/PmModel/common-date.model";
import { CommonModel } from "src/app/PmModel/common.model";
import { DialogModel } from "src/app/PmModel/dialog.model";
import { Tenant } from "src/app/PmModel/tenant.model";
import { DatePickerHelper } from "src/app/core/commondatepicker/datepicker-helper";
import { DatepickerService } from "src/app/core/commondatepicker/datepicker.service";
import { tap } from 'rxjs/operators';

@Component({
  selector: "app-tenant-dashboard",
  templateUrl: "./tenant-dashboard.component.html",
  styleUrls: ["./tenant-dashboard.component.scss"],
})
export class TenantDashboardComponent implements OnInit {
  public commonModel: CommonModel;
  public commonDateModel: CommonDateModel;
  public dialogModel: DialogModel;
  userDetails: any;
  helper = new JwtHelperService();
  isAuthorized: any;
  tenantLoadMessage: string = "Loading..... Tenant";
  public reportObj: ReportObj = new ReportObj();
  ngUnsubscribe: Subject<void> = new Subject<void>();
  durations: any;
  dr: string = "";
  previousDuration: string;
  tenants: any;
  flag: boolean;

  /**
   *
   * @param _route
   * @param reportService
   * @param reportHelper
   * @param _core
   * @param _utility
   * @param tenantService
   * @param cdRef
   * @param utility
   * @param dialog
   * @param datePickerHelper
   * @param cdr
   * @param dateService
   */
  constructor(
    private _route: Router,
    private reportService: ReportingService,
    public reportHelper: ReportHelper,
    public _core: CoreUtilityService,
    public _utility: AppUtilService,
    private tenantService: TenantService,
    public cdRef: ChangeDetectorRef,
    public utility: UtilityService,
    private dialog: MatDialog,
    public datePickerHelper: DatePickerHelper,
    private cdr: ChangeDetectorRef,
    public dateService: DatepickerService,

  ) {
    this.commonDateModel = this.tenantService.currentDateValue;
    this.userDetails = localStorage.bearerToken;
    this.isAuthorized = this.helper.decodeToken(this.userDetails);
    this.datePickerHelper.getDateTimeDurations().subscribe((data) => {
      this.durations = data.durations;
      this.dr = this.durations[1].value;
    });
  }

  ngOnInit() {
    var mastertenantValue = localStorage.getItem('mastertenant');
    if (mastertenantValue == "true") {
      localStorage.setItem('mastertenant', 'false');
    }
    this._utility.showSpinner = false;
    this.commonDateModel = this.tenantService.currentDateValue;
    if (this.tenantService.currentTenantValue.tenantId == undefined) {
      this._route.navigate(['home/home-dashboard']);
    }
    this.commonModel = this.tenantService.currentTenantValue;
    this.gettenants();
  }

  /**
   * @param userId
   *
   */
  gettenants() {
    this.tenantService.setData(this.commonModel);
    this.getDates()
  }

  getDates() {
    this.tenantService.currentDate
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (tenant) => {
          this.tenants = tenant;
          if (tenant === undefined) {
            // this._adhocService.reportParams.objectType = "";
            return;
          }
          this.setReportParams().pipe(concatMap(() => {
            if (this.reportHelper.rptParamValues) {
              if (this.commonDateModel.duration !== this.dr) {
                this.previousDuration = this.commonDateModel.duration;
                this.getReportData();
              } else {
                this.previousDuration = this.commonDateModel.duration;
                this.getReportData();
              }
            }
            this.flag = true;
            return of(null); // Return an observable to satisfy concatMap
          })
          )
            .subscribe();
        },
        (err) => {
          console.log(err);
        }
      );
  }

  setReportParams() {
    let fromDate = this.utility.convert(this.commonDateModel.startDate);
    let toDate = this.utility.convert(this.commonDateModel.endDate);
    let userId = this.isAuthorized.userId;

    this.reportHelper.rptParamValues = {
      Section: 1,
      sdt: fromDate,
      edt: toDate,
      uid: userId,
      Home: false,
      tn: this.commonModel.tenantId,
    };
    this.reportHelper.reportInnerHtml = "<p></p>";
    this.reportHelper.hasChild = false;
    this.reportHelper.reportObj.ReportName = "Home";
    this.reportHelper.rptPathName = "Dashboard";
    return this.reportService
      .getHomeDashboardPath('', 'Home-Dashboard', this.commonModel.tenantId)
      .pipe(
        tap((data1) => {
          console.log(data1);
          this.reportHelper.reportObj.RptPath = data1.toString();
          this.reportHelper.parentReportPath = data1.toString();
        })
      );
  }


  globalDPApply() {
    this._utility.globalDr = this.commonDateModel.duration;
    this._utility.globalSDT = this.commonDateModel.startDate;
    this._utility.globalEDT = this.commonDateModel.endDate;
    var res = this.commonDateModel.resolution;
    if (res === undefined) {
      res = "actual";
    }
    this.dr = this._utility.globalDr;
    this._utility.resolution = res;
  }

  getReportData() {
    let userId = this.isAuthorized.userId;
    let fromDate = this.utility.convert(this.commonDateModel.startDate);
    let toDate = this.utility.convert(this.commonDateModel.endDate);
    if (this._route.url.includes('sysactivity')) {
      this.reportHelper.reportObj.ReportName = this.reportHelper.rptObj.rptName;
      this.reportHelper.reportObj.RptPath = this.reportHelper.parentReportPath;
      this.reportHelper.rptParamValues = {
        Section: 1,
        sdt: fromDate,
        edt: toDate,
        uid: userId,
        Home: true,
        //  tn: this._utility.tenantId.id,
      };
      // this.reportHelper.getParentReport();
    }
    else {
      this.reportHelper.getParentReport();
    }
  }
}
