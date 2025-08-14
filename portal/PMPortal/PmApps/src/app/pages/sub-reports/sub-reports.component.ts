import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subject, Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { TenantService, ReportingService } from "src/app/PmCore/services";
import { UtilityService } from "src/app/PmCore/services/utility.service";
import { AppUtilService } from "src/app/PmCore/shared/app-util.service";
import { ReportObj } from "src/app/PmModel/ReportObj";
import { CommonDateModel } from "src/app/PmModel/common-date.model";
import { CommonModel } from "src/app/PmModel/common.model";
import { ReportHelper } from 'src/app/PmCore/shared/report-helper';

@Component({
  selector: "app-sub-reports",
  templateUrl: "./sub-reports.component.html",
  styleUrls: ["./sub-reports.component.scss"],
})
export class SubReportsComponent implements OnInit, OnDestroy {
  public reportObj: ReportObj = new ReportObj();
  public commonDateModel: CommonDateModel;
  public commonModel: CommonModel;
  rptObj: any = {};
  hasChild: boolean;
  showSpinner: boolean;
  private reportSubscription: Subscription;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  reportInnerHtml: any = "<p></p>";
  parentReportPath: string;
  rptParamValues: {};

  constructor(
    private _route: Router,
    private tenantService: TenantService,
    private reportService: ReportingService,
    private utility: UtilityService,
    private AppUtilityService: AppUtilService,
    public _utility: AppUtilService,
    public reportHelper: ReportHelper
  ) { }

  ngOnInit() {
    var mastertenantValue = localStorage.getItem('mastertenant');
    if (mastertenantValue == "true") {
      localStorage.setItem('mastertenant', 'false');
    }
    this.gettenants()
    this.getSubReport();
  }

  gettenants() {
    if (this.tenantService.currentTenantValue.tenantId == undefined) {
      this._route.navigateByUrl("home/home-dashboard");
    }
  }

  getSubReport() {
    this.rptObj.format = this.AppUtilityService.reportFormat;
    this.reportObj.HasChild = this.reportHelper.hasChild;
    this.reportObj.ReportFormat = this.reportHelper.rptObj.format;
    this.reportObj.ReportParams = JSON.stringify(this.reportHelper.rptParamValues);
    this.reportObj.RptPath = this.reportHelper.reportObj.RptPath
    if (
      this.reportObj.RptPath.includes("Alarm%20Summary%20Report&rid=") == true
    ) {
      const newPath1 = this.reportObj.RptPath.split("&");
      const subRpt = newPath1[0].split("%2F")[3];
      const getTent = newPath1[2].split("=");
      this.AppUtilityService.tenantId = getTent[1];
      this.commonModel = new CommonModel();
      const i = this._utility.tenants;
      i.forEach((element) => {
        if (element["id"] == this.AppUtilityService.tenantId) {
          this._utility.tenants = this._utility.tenants;
          this._utility.Dtenant = element;
          this._utility.tenantId = this._utility.Dtenant;
          this.commonModel.tenantId = this._utility.Dtenant.id;
          this.commonModel.tenantName = this._utility.Dtenant.tenantName;
          this._utility.Dtenant = this._utility.tenants;
          this.rptObj.format = this.AppUtilityService.reportFormat;
          this.reportObj.HasChild = this.reportHelper.hasChild;
          this.reportObj.ReportFormat = this.rptObj.format;
          this.reportObj.TenantId = this.AppUtilityService.tenantId.id
          this.tenantService.currentTenantValue.tenantId = this.AppUtilityService.tenantId.id
          let sdt = encodeURIComponent(
            this.utility.convert1(this.tenantService.currentDateValue.startDate)
          );
          let edt = encodeURIComponent(
            this.utility.convert1(this.tenantService.currentDateValue.endDate)
          );
          this.reportObj.RptPath = this.reportObj.RptPath;
          this.reportSubscription = this.reportService
            .runReport(this.reportObj)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
              this.reportHelper.reportInnerHtml = data;
              this.reportHelper.reportClick();
              this.showSpinner = false;
              this.reportHelper.setPage();
            });
          this.reportHelper.parentReportPath = this.reportObj.RptPath;
          this._route.navigate([
            "/tDashboard",
            this.commonModel.tenantId,
            subRpt,
          ]);
        } else {
          return;
        }
      });
    } else if (
      this.reportObj.RptPath.includes(
        "Alarm%20Summary%20Detail%20Report"
      ) == true
    ) {
      const newPath2 = this.reportObj.RptPath.split("&");
      const subRpt = newPath2[0].split("%2F")[3];
      // const getTent = newPath2[2].split("=");
      this.AppUtilityService.tenantId = this.tenantService.currentTenantValue.tenantId;

      const i = this._utility.tenants;
      i.forEach((element) => {
        if (element["id"] == this.AppUtilityService.tenantId) {
          this._utility.tenants = this._utility.tenants;
          this._utility.Dtenant = element;
          this._utility.tenantId = this._utility.Dtenant;
          this.commonModel.tenantId = element.id;
          this.commonModel.tenantName = element.tenantName;
          this.rptObj.format = this.AppUtilityService.reportFormat;
          this.reportObj.HasChild = this.reportHelper.hasChild;
          this.reportObj.ReportFormat = this.AppUtilityService.reportFormat;
          this.reportObj.TenantId = this.tenantService.currentTenantValue.tenantId;
          let sdt = encodeURIComponent(
            this.utility.convert1(this.tenantService.currentDateValue.startDate)
          );
          let edt = encodeURIComponent(
            this.utility.convert1(this.tenantService.currentDateValue.endDate)
          );
          this.reportObj.RptPath = this.reportObj.RptPath;

          this.reportSubscription = this.reportService
            .runReport(this.reportObj)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
              this.reportHelper.reportInnerHtml = data;
              this._utility.reportData = this.reportInnerHtml;
              this._utility.setPage();
              this.reportHelper.reportClick();
              this.showSpinner = false;
              //  this._route.navigate(['/tDashboard', this.commonModel.tenantId,subRpt]);
            });
        } else {
          return;
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.reportSubscription) {
      this.reportSubscription.unsubscribe();
    }

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
