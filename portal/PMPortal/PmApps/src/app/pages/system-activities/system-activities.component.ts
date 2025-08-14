import {
  Component,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  Input,
} from "@angular/core";
import { CommonModel } from "src/app/PmModel/common.model";
import { Subject } from "rxjs";
import { ReportObj } from "src/app/PmModel/ReportObj";
import { TenantService, ReportingService } from "src/app/PmCore/services";
import { UtilityService } from "src/app/PmCore/services/utility.service";
import { ReportHelper } from "src/app/PmCore/shared/report-helper";
import { takeUntil } from "rxjs/operators";
import { CommonDateModel } from "src/app/PmModel/common-date.model";
import { CoreUtilityService } from "src/app/PmCore/shared/core-utility.service";
import { AppUtilService } from "src/app/PmCore/shared/app-util.service";
import { JwtHelperService } from "@auth0/angular-jwt";
import { ToolbarComponent } from "src/app/layout";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from '@angular/common';
@Component({
  selector: "app-system-activities",
  templateUrl: "./system-activities.component.html",
  styleUrls: ["./system-activities.component.scss"],
})
export class SystemActivitiesComponent implements OnInit {
  @Input() sanitizeHtml: string;
  public commonDateModel: CommonDateModel;
  selectedTabIndex: number;
  rptObj: any;
  reportsList: any;
  reportInnerHtml: string = "";
  isTabLink: boolean;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  hasChild: string;
  rptPathName: string;
  selectedTab1: string;
  reportData: string;
  rptParamValues: any = {};
  public reportObj: ReportObj = new ReportObj();
  showSpinner: boolean;
  tenants: any;
  pageNo: any;
  isAuthorized: any;
  helper = new JwtHelperService();
  userDetails: any;
  selectedTabName: any;
  previousDuration: string;
  previousTenant: string;
  routechange: boolean;

  constructor(
    public tenantService: TenantService,
    private location: Location,
    private reportService: ReportingService,
    private utility: UtilityService,
    public reportHelper: ReportHelper,
    private coreService: CoreUtilityService,
    private _utility: AppUtilService,
    public cdRef: ChangeDetectorRef,
    private router: Router,
    public _toolbar: ToolbarComponent,
    private route: ActivatedRoute,
  ) {
    this.sanitizeHtml = `<svg></svg>`;
    this.userDetails = localStorage.bearerToken;
    this.isAuthorized = this.helper.decodeToken(this.userDetails);
  }

  ngOnInit() {
    var mastertenantValue = localStorage.getItem('mastertenant');
    if (mastertenantValue == "true") {
      localStorage.setItem('mastertenant', 'false');
      this.tenantService.triggerTenantSelected(this._utility.tenantId);
    }
    this._toolbar.enablebutton();
    this.routechange = true;
    this.utility.adhocPreviousRoute = "";
    this._utility.showSpinner = false;
    this.commonDateModel = this.tenantService.currentDateValue;
    this.reportService
      .getSystemActivities()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data) => {
        this.reportsList = data[0];
        this.getTenants();
        this.getDates();
      });
  }


  tabSelectionChanged(event) {

    if (this.routechange) {
      let tabMapping = {
        'sysactivity/DataSources': { index: 1, name: 'DataSources' },
        'sysactivity/DataFlows': { index: 2, name: 'DataFlows' },
        'sysactivity/Reports': { index: 3, name: 'Reports' },
        'sysactivity/Databases': { index: 4, name: 'Databases' },
        'sysactivity/Dashboard': { index: 0, name: 'Dashboard' }
      };

      let routeConfig = this.route.routeConfig;
      let selectedTab = tabMapping[routeConfig.path];

      if (selectedTab) {
        this.selectedTabIndex = selectedTab.index;
        this.selectedTabName = selectedTab.name;
      }
      this.setReportParams();
      this.reportHelper.getParentReport();
      this.router.navigateByUrl(`home/sysactivity/${this.selectedTabName}`);
      this.routechange = false;
    } else {
      this.selectedTabIndex = event.index;
      this.selectedTabName = event.tab.textLabel;
      this.setReportParams();
      this.reportHelper.getParentReport();
      this.router.navigateByUrl(`home/sysactivity/${this.selectedTabName}`);
      this.routechange = false;

    }

  }


  getTenants() {
    this.tenantService.currentTenant
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (tenant) => {
          this.tenants = tenant;
          if (tenant.tenantId === undefined) {
            this.utility.reportParams.objectType = "";
            return;
          }
          else {
            if (
              this.selectedTabName == "Reports" ||
              this.selectedTabName == "Databases" ||
              this.selectedTabName == "Dashboard" ||
              this.selectedTabName == "DataSources" ||
              this.selectedTabName == "DataFlows"
            ) {
              this.setReportParams();
              this.reportHelper.getParentReport();
            }

          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  getDates() {
    this.tenantService.currentDate
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (tenant) => {
          console.log(this.utility.paramDevNum);
          this.tenants = tenant;
          if (tenant === undefined) {
            this.utility.reportParams.objectType = "";
            return;
          }
          if (
            this.selectedTabName == "Reports" ||
            this.selectedTabName == "Databases" ||
            this.selectedTabName == "Dashboard" ||
            this.selectedTabName == "DataSources" ||
            this.selectedTabName == "DataFlows"
          ) {
            if (this.commonDateModel.duration !== this.previousDuration) {
              this.previousDuration = this.commonDateModel.duration;
              console.log(this.commonDateModel);
              this.setReportParams();
              this.reportHelper.getParentReport();
            }
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  setReportParams() {
    let userId = this.isAuthorized.userId;
    let fromDate = this.utility.convert(this.commonDateModel.startDate);
    let toDate = this.utility.convert(this.commonDateModel.endDate);
    this.isTabLink = true;
    this.reportHelper.reportInnerHtml = "<p></p>";
    this.reportHelper.hasChild = false;
    if (this.selectedTabIndex == undefined) {
      this.selectedTabIndex = 0;
    }
    this.reportHelper.rptObj = Object.assign(
      {},
      this.reportsList[this.selectedTabIndex].jobject
    );
    this.reportHelper.rptPathName = "";
    this.selectedTab1 = this.reportHelper.rptPathName;
    this.reportHelper.rptObj.section = 1;
    this.reportHelper.reportObj.RptPath = this.reportHelper.rptObj.rptPath;

    // this.newValue = this._utility.tenant;
    // this._utility.dealer = this.userDetails.userProfile['dealerId'];
    this.reportHelper.rptParamValues = {
      Section: 1,
      uid: userId,
      Home: true,
      sdt: fromDate,
      edt: toDate,
      //  tn: this._utility.tenantId.id,
    };

    if (this.reportHelper.rptObj.params !== "") {
      this.reportHelper.rptParamValues = {
        Section: 1,
        sdt: fromDate,
        edt: toDate,
        uid: userId,
        Home: true,
        //  tn: this._utility.tenantId.id,
      };
      this.reportHelper.rptObj.tenantId =
        this.tenantService.currentTenantValue.tenantId;
      this.reportHelper.reportObj.ReportName = this.reportHelper.rptObj.rptName;
      this.reportHelper.reportObj.RptPath = this.reportHelper.rptObj.rptPath;
      this.reportHelper.parentReportPath = this.reportHelper.rptObj.rptPath;
    } else {
      this.reportHelper.rptObj.params = "";
      this.reportHelper.rptObj.tenantId =
        this.tenantService.currentTenantValue.tenantId;
      this.reportHelper.reportObj.ReportName = this.reportHelper.rptObj.rptName;
      this.reportHelper.reportObj.RptPath = this.reportHelper.rptObj.rptPath;
      this.reportHelper.parentReportPath = this.reportHelper.rptObj.rptPath;
    }
  }
  // Report Fetching based on the date range and tenant
  getReportData() {
    this.setReportParams();
    this.reportHelper.getParentReport();
  }
  ngAfterContentChecked() {
    this.cdRef.detectChanges();
  }
  ngAfterViewInit() {
    this.cdRef.detectChanges();
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
