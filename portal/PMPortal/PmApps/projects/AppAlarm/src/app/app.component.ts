import { ToastrService } from 'ngx-toastr';
import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
import { TenantService } from "src/app/PmCore/services/TenantService/TenantService.service";
import { Tenant } from "src/app/PmModel/tenant.model";
import { ReportingService, AppService } from "src/app/PmCore/services";
import { CommonModel } from "src/app/PmModel/common.model";
import { AppUtilService, DeleteDialog } from "src/app/PmCore/shared/app-util.service";
import { AdhocReportutilityService } from 'projects/AppAdhoc/src/app/adhoc-reportutility.service';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppRoutes } from 'src/app/pages/apps/app-routes.enum';
import { UtilityService } from 'src/app/PmCore/services/utility.service';

@Component({
  selector: "app-alarm",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  apps: any = [];
  title = "app-crenv";
  public tenant: Tenant = new Tenant();
  public commonModel: CommonModel;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  public routesEnum = AppRoutes;
  routeUrl: string;
  tenantService: any;
  showSpinner: boolean;
  constructor(
    public utility: UtilityService,
    public _utility: AppUtilService,
    public _route: Router,
    private route: ActivatedRoute,
    private _rptService: ReportingService,
    public _tenant: TenantService,
    public _appService: AppService,
    public _Adhocutility: AdhocReportutilityService,
    public toastrService: ToastrService,
    public dialog: MatDialog,
    public _reportService: ReportingService,
    private appService: AppService,
    private coreService: CoreUtilityService,
  ) {
    this.commonModel = this._tenant.currentTenantValue;
    this._utility.tenantID = this.commonModel.tenantId;
    this._utility.userID = this.commonModel.userId;
    if (this._utility.tenantID === undefined) {
      // this._route.navigateByUrl("home/apps");
      return;
    }
    this.getAppID();

  }
  configure() {
    this._utility.isObjectSelection = false;
    this._utility.isConfigure = true;
    this._utility.isReportList = false;
    this._utility.isCreateReport = false;
  }
  reportList() {
    this._utility.isObjectSelection = false;
    this._utility.isConfigure = false;
    this._utility.isReportList = true;
    this._utility.isCreateReport = false;
  }
  createReport() {
    if (this._utility.licenseInfo.isLimitedEdition) {
      this._rptService.checkDeviceLimitOnInstance().subscribe(
        (isWithinDeviceLimit: boolean) => {
          let message = "";

          if (!isWithinDeviceLimit) {
            message = "You have reached the maximum number of devices allowed under your current license. To continue creating or editing reports, you need to update your license to allow more devices.<br/> Please contact LogicMatter at <b>support@logicmatter.com</b>";
          }

          else{
            // if (this._utility.reportsList.length >= this._utility.licenseInfo.reportLimit) {
            //   message = "Reached the report creation limit in this Edition.<br/> Please contact LogicMatter at <b>support@logicmatter.com</b>";
            // }
            // else{
              this._utility.selectedItems = [];
              this._Adhocutility.checkedList = [];
              this._utility.isObjectSelection = false;
              this._utility.isReportRun = false;
              this._utility.isbreadEditReport = false;
              this._utility.isRunFeatures = false;
              this._utility.toggle = false;
              this._utility.isClickedToggle = false;
              this._utility.mainWidthToggle = false;
              this._utility.isConfigure = false;
              this._utility.isReportList = false;
              this._utility.isCreateReport = true;
              this._utility.reportData = undefined;
              this._utility.reportID = "";
              // console.log(this._route.navigate(['appAlarm', this._utility.appID, 'Create']) + "abc");
              this._route.navigateByUrl('home/apps/appAlarm/' + this._utility.appID + '/create');
            // }

          }



          if (message) {
            this.dialog.open(DeleteDialog, {
              width: "390px",
              data: { id: 0, type: "", message, action: "Warning", title: "⚠️  Notice" },
            });
            return;
          }
        },
        (error) => console.error("Error checking device limit:", error)
      );
    }
    else{
    this._utility.selectedItems = [];
    this._Adhocutility.checkedList = [];
    this._utility.isObjectSelection = false;
    this._utility.isReportRun = false;
    this._utility.isbreadEditReport = false;
    this._utility.isRunFeatures = false;
    this._utility.toggle = false;
    this._utility.isClickedToggle = false;
    this._utility.mainWidthToggle = false;
    this._utility.isConfigure = false;
    this._utility.isReportList = false;
    this._utility.isCreateReport = true;
    this._utility.reportData = undefined;
    this._utility.reportID = "";
    // console.log(this._route.navigate(['appAlarm', this._utility.appID, 'Create']) + "abc");
    this._route.navigateByUrl('home/apps/appAlarm/' + this._utility.appID + '/create');
  }
  }
  ngOnInit() {
    this._utility.reportsList.length = 0
    this.utility.entitySelected = 'Reports'
    this._utility.Transpage = this._route.url
    this._utility.showSpinner = false;
    this._utility.isReportRun = false;
    this._utility.isbreadEditReport = false;
    this._utility.isObjectSelection = false;
    this._utility.isConfigure = false;
    this._utility.isReportList = false;
    this._utility.isCreateReport = false;
    this._utility.isRunFeatures = false;
    this._route.events.pipe(takeUntil(this.ngUnsubscribe)).subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
    this.getTenantID();
  }
  getAppsList() {
    this.tenantService.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      tenant => {
        this.showSpinner = true;
        if (tenant.tenantId === undefined) {
          return;
        }
        if (this.tenantService.currentTenantValue.tenantId) {
          this._reportService.connectToReportServerForQuickConnectivityInApps(this.tenantService.currentTenantValue.tenantId).subscribe(resp => resp, err => { });
        }
        this.appService.getAppsList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          if (data) {
            this.showSpinner = false;
            this.apps = data;
          }
        }, err => {
          this.showSpinner = false;
          this.toastrService.error('Failed to get Apps list');
        });
      });
  }
  getTenantID() {
    this._tenant.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(tenant => {
      if (tenant === undefined) {
        return;
      }
      if (this._utility.previousTenant != undefined && this._route.url.includes("run") != true) {
        if (this._tenant.currentTenantValue.tenantName != this._utility.previousTenant) {
          this._utility.showSpinner = false;
          this._utility.previousTenant = this._tenant.currentTenantValue.tenantName;
          this.coreService.previousTenant = this._tenant.currentTenantValue.tenantName;
          this._utility.tenantID = tenant.tenantId;
          this._utility.appName = "Alarm";
          this._utility.reportData = '';
          this._utility.isReportRun = false;
          this._utility.isbreadEditReport = false;
          this._utility.isConfigure = false;
          this._utility.isReportList = true;
          this._utility.isCreateReport = false;
          this._utility.isRunFeatures = false;
          this._utility.rptObj = '';
          this._utility.reportID = '';
          if (this._utility.appName) {
            this.routeUrl = this.routesEnum[this._utility.appName.toLowerCase()] + '/' + this._utility.appID;
            this._route.navigateByUrl(this.routeUrl);
          }
        }
      }
      else {
        this._utility.previousTenant = this._tenant.currentTenantValue.tenantName;
        this.coreService.previousTenant = this._tenant.currentTenantValue.tenantName;
      }
      if (!tenant.hasOwnProperty("tenantId") || !tenant.hasOwnProperty("userId")) {
        return;
      }
      this.commonModel = this._tenant.currentTenantValue;
      this._utility.tenantID = this.commonModel.tenantId;
      this._utility.userID = this.commonModel.userId;
      if (this._utility.tenantID === undefined) {
        // this._route.navigateByUrl("home/apps");
        return;
      }
      this.getAppID();
    });
  }

  setRptData() {
    this._rptService
      .getReportList(
        this._utility.userID,
        this._utility.appID,
        this._utility.tenantID,
        this.utility.entitySelected
      ).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        data => {
          let reportobj;
          if (data) {
            this._utility.reportsList = data;
            this._utility.rptObj = data;
            reportobj = this._utility.rptObj.find(
              p => p.reportId == this._utility.reportID
            );
            if (reportobj == undefined) {
              this._utility.isConfigure = false;
              this._utility.isReportList = true;
              this._utility.isCreateReport = false;
            } else if (reportobj.reportId == this._utility.reportID) {
              if (this.hasAction() == "run") {
                this._utility.toggle = false;
                this._utility.templateID = reportobj.templateId
                this._utility.isClickedToggle = false;
                this._utility.mainWidthToggle = false;
                this._utility.reportData = "";
                this._utility.isbreadEditReport = false;
                this._utility.isReportRun = true;
                this._utility.totalNoPages = "";
                this._utility.currentPage = 1;
                this._utility.isCreateReport = true;
                this._utility.isReportList = false;
              } else if (this.hasAction() == "edit") {
                this._utility.reportData = "";
                this._utility.templateID = reportobj.templateId
                this._utility.totalNoPages = "";
                this._utility.currentPage = 1;
                this._utility.isConfigure = false;
                this._utility.isReportList = false;
                this._utility.toggle = true;
                this._utility.isReportRun = false;
                this._utility.isbreadEditReport = true;
                this._utility.isRunFeatures = false;
                // this._utility.isReportRun = false;
                this._utility.isCreateReport = true;
              }
            } else {
              this._utility.isConfigure = false;
              this._utility.isReportList = true;
              this._utility.isCreateReport = false;
            }
          }
          else {
            this._utility.isConfigure = false;
            this._utility.isReportList = true;
            this._utility.isCreateReport = false;
          }
        },
        error => {
          console.log(error);
          this._utility.isConfigure = false;
          this._utility.isReportList = true;
          this._utility.isCreateReport = false;
        }
      );
  }
  hasAction() {
    let itHasAction;
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(paramMap => {
      if (paramMap.get("action")) {
        this._utility.action = paramMap.get("action");
        itHasAction = paramMap.get("action");
      } else {
        itHasAction = paramMap.get("action");
      }
    });
    return itHasAction;
  }
  hasReportId() {
    let itHasReportId: boolean;
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(paramMap => {
      if (paramMap.get("id")) {
        this._utility.reportID = Number(paramMap.get("id"));

        itHasReportId = true;
        this._utility.isConfigure = false;
        this._utility.isReportList = false;
        this._utility.isCreateReport = false;
      } else {
        itHasReportId = false;
        this._utility.isConfigure = false;
        this._utility.isReportList = true;
        this._utility.isCreateReport = false;
      }
    });
    return itHasReportId;
  }
  hasAppId(): boolean {
    let itHasAppId: boolean = false;
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(paramMap => {
      if (paramMap.get("appId")) {
        this._utility.appID = paramMap.get("appId");
        this._appService.getAppInfo(this._utility.appID).pipe(takeUntil(this.ngUnsubscribe)).subscribe((resp) => {
          if (resp) {
            itHasAppId = resp.isActive;
            if (!itHasAppId) {
              this.toastrService.warning('This App is not Licensed. Please contact LogicMatter Support');
              this._route.navigateByUrl("home/apps");
              return false;
            } else {
              this._utility.appName = resp.appName;
              this._utility.normalizedAppName = resp.normalizedAppName;
              if (this.hasReportId()) {
                this.setRptData();
              } else {
                this._utility.reportData = "";
                this._utility.isReportRun = false;
                this._utility.isConfigure = false;
                this._utility.isReportList = true;
                this._utility.isCreateReport = false;
                this._utility.isRunFeatures = false;
                this._utility.isbreadEditReport = false;
              }
              return true;
            }
          } else {
            this.toastrService.error('No such App found');
            this._route.navigateByUrl("home/apps");
            return false;
          }
        }, err => {
          this.toastrService.error('Error occurred to get App details');
          this._route.navigateByUrl("home/apps");
          return false;
        });
      } else {
        this.toastrService.error('App Id is not valid');
        this._route.navigateByUrl("home/apps");
        return false;
      }
    });
    return itHasAppId;
  }
  getAppID() {
    if (this.hasAppId()) {

    }
  }


  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
