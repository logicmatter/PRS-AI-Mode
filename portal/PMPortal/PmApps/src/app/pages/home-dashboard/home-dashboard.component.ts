import { CommonModel } from "src/app/PmModel/common.model";
import { ConfirmationDialogComponent } from "../../core/confirmation-dialog/confirmation-dialog.component";
import {
  Component,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  Input,
} from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";

// Models
import { DialogModel } from "../../PmModel/dialog.model";
// Services
import { TenantService } from "../../PmCore/services/TenantService/TenantService.service";
import { AppUtilService } from "src/app/PmCore/shared/app-util.service";
import { JwtHelperService } from "@auth0/angular-jwt";
import { UtilityService } from "src/app/PmCore/services/utility.service";
import { Subject, of } from "rxjs";
import { takeUntil, skip, concatMap } from "rxjs/operators";
import { element } from "protractor";
import { ReportObj } from "src/app/PmModel/ReportObj";
import { ReportHelper } from "src/app/PmCore/shared/report-helper";
import { ReportingService } from "src/app/PmCore/services";
import { CommonDateModel } from "src/app/PmModel/common-date.model";
import { CoreUtilityService } from "src/app/PmCore/shared/core-utility.service";
import { DatepickerService } from "src/app/core/commondatepicker/datepicker.service";
import { DatePickerHelper } from "src/app/core/commondatepicker/datepicker-helper";
import { Router } from "@angular/router";
import { ToolbarComponent } from "src/app/layout";
import { tap } from 'rxjs/operators';
import { Location } from "@angular/common";




@Component({
  selector: "app-home-dashboard",
  templateUrl: "./home-dashboard.component.html",
  styleUrls: ["./home-dashboard.component.scss"],
})
export class HomeDashboardComponent implements OnInit {
  // @Input() sanitizeHtml: string;
  public commonModel: CommonModel;
  public commonDateModel: CommonDateModel;
  public dialogModel: DialogModel;
  public reportObj: ReportObj = new ReportObj();
  userDetails: any;
  tenantLoadMessage: string = "Loading..... Tenant";
  helper = new JwtHelperService();
  isAuthorized: any;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  tenants: any;
  tenantId: any;
  rptParamValues: any = {};
  rptData: any;
  durations: any;
  dr: string = "";
  flag: boolean;
  previousDuration: string;
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
    public _toolbar: ToolbarComponent,
    private location: Location,

  ) {
    this.commonDateModel = this.tenantService.currentDateValue;
    this.userDetails = localStorage.bearerToken;
    this.isAuthorized = this.helper.decodeToken(this.userDetails);
    this._route.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
  }

  ngOnInit() {
    this._toolbar.enablebutton();
    this.utility.entitySelected = "All"
    this._utility.showSpinner = false;

    this.commonDateModel = this.tenantService.currentDateValue;
    if (this.tenantService.currentTenantValue.tenantId == undefined) {
      this.commonModel = new CommonModel();
      this.gettenants();
    }
    else {
      // window.location.href = window.location.origin + window.location.pathname;
      this.tenantService.triggerTenantSelected(this._utility.tenantId);
      this._utility.tenantId = this.tenantService.currentTenantValue.tenantId
      this.commonModel = new CommonModel();
      this.commonModel.tenantId = this.tenantService.currentTenantValue.tenantId
      this.commonModel.tenantName = this.tenantService.currentTenantValue.tenantName
      this.commonModel.userId = this.tenantService.currentTenantValue.userId
      this.tenantService.setData(this.commonModel);
      this.getDates()


    }
  }
  gettenants() {
    this.reportHelper.showSpinner = true;
    this.tenantService
      .getAllTenants(this.isAuthorized.userId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (resp) => {
          if (resp) {
            if (resp.length > 0) {
              const i = resp;
              i.forEach((element) => {
                if (element["tenantName"] == i[0].tenantName) {
                  this._utility.tenants = resp;
                  this._utility.Dtenant = element;
                } else {
                  return;
                }
              });
              this._utility.tenantId = this._utility.Dtenant.id;
            }
            this.commonModel.tenantId = this._utility.Dtenant.id;
            this.commonModel.tenantName = this._utility.Dtenant.tenantName;
            this.tenantService.setData(this.commonModel);
            this.reportHelper.hasChild = false;
            this.reportHelper.userId = this.isAuthorized.userId;
            this.reportHelper.reportObj.TenantId = this._utility.Dtenant.id;
            this.getDates();
          } else {
            this.tenantLoadMessage = "No Tenant configured";
          }
        },
        (err) => {
          this.tenantLoadMessage = "Failed to fetch Tenant";
        }
      );
  }

  getDates() {
    this.tenantService.currentDate
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (tenant) => {
          this.tenants = tenant;

          if (tenant === undefined) {
            return;
          }

          this.setReportParams()
            .pipe(
              concatMap(() => {
                if (this.reportHelper.rptParamValues) {
                  if (this.commonDateModel.duration !== this.dr) {
                    this.previousDuration = this.commonDateModel.duration;
                    this.getReportData(); // Move getReportData inside concatMap
                  } else {
                    this.previousDuration = this.commonDateModel.duration;
                    this.getReportData(); // Move getReportData inside concatMap
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

  getReportData() {
    this.reportHelper.getParentReport();
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
      Home: true,
      tn: this._utility.tenantId,
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


  public openConfirmationDialog(): void { }

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

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
