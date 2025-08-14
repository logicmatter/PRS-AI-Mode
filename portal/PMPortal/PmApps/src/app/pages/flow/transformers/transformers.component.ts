import {
  Component,
  OnInit,
  Renderer2,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { ReportObj } from "src/app/PmModel/ReportObj";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { MatDialog } from "@angular/material/dialog";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { AdhocReportutilityService } from "projects/AppAdhoc/src/app/adhoc-reportutility.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AppRoutes } from "src/app/pages/apps/app-routes.enum";
import { Location } from '@angular/common';
import {
  ReportingService,
  TenantService,
  AppService,
} from "src/app/PmCore/services";
import { UtilityService } from "src/app/PmCore/services/utility.service";
import { AppSharedService } from "src/app/PmCore/shared/app-shared.service";
import {
  AppUtilService,
  DeleteDialog,
} from "src/app/PmCore/shared/app-util.service";
import { CommonModel } from "src/app/PmModel/common.model";
import { Tenant } from "src/app/PmModel/tenant.model";
import { SchedulerService } from "src/app/PmCore/services/SchedulerService/scheduler.service";
import { ReportUserModel } from "src/app/PmModel/ReportUserModel";
import { ScheduledFilesDialogComponent } from "src/app/core/scheduled-files-dialog/scheduled-files-dialog.component";
import { AuthGuard } from "src/app/guards/auth-guard.service";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { FlowService } from "src/app/PmCore/services/FlowService/flow.service";


@Component({
  selector: "app-transformers",
  templateUrl: "./transformers.component.html",
  styleUrls: ["./transformers.component.scss"],
})
export class TransformersComponent implements OnInit {
  ngUnsubscribe: Subject<void> = new Subject<void>();
  showSpinner: boolean = true;
  appNames: string[] = [];
  appIds: string[] = [];
  displayedColumns = [
    "appName",
    "reportName",
    "createdBy",
    "lastModifiedOn",
    "actions",
  ];
  public showTransformers = false;
  public appId: string;
  public reportObj: ReportObj = new ReportObj();
  selectedAppIndex = -1;
  routeUrl: string;
  public routesEnum = AppRoutes;
  rptUserModel: ReportUserModel = new ReportUserModel();
  tenants: CommonModel;
  selectedTabIndex: number = 0;

  constructor(
    private appService: AppService,
    private renderer: Renderer2,
    private el: ElementRef,
    private router: Router,
    public tenantService: TenantService,
    private _service: FlowService,
    private toastrService: ToastrService,
    private _rptService: ReportingService,
    public _utility: AppUtilService,
    private schedulerService: SchedulerService,
    public toastr: ToastrService,
    public dialog: MatDialog,
    private authGaurd: AuthGuard,
    public utility: UtilityService,
    private location: Location,
    public _Adhocutility: AdhocReportutilityService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.showSpinner = true;
    this._utility.importerdatasource = true;
    this._utility.isbreadEditReport = false;
    const storedTabIndex = localStorage.getItem("selectedTabIndex");
    if (storedTabIndex !== null) {
      this.selectedTabIndex = +storedTabIndex;
      if(this.selectedTabIndex == 1)
      {
        this._utility.Transformerdatasource = "Transformer";
      }
      else if(this.selectedTabIndex == 2)
      {
        this._utility.Transformerdatasource = "Exporter";
      }
      else if(this.selectedTabIndex == 3)
        {
          this._utility.Transformerdatasource = "Maintainer";
        }

    }
    this._utility.reportFormat = "HTML4.0";
    this._utility.reportData = "";
    this._utility.isReportRun = false;
    this._utility.isRunFeatures = false;
    const tabMapping = ['Importer', 'Transformers', 'Exporter', 'Maintainer'];
    this.utility.entitySelected = tabMapping[this.selectedTabIndex] || 'Importer';
    this._utility.Transpage = this.router.url;
    this._utility.userID = this.tenantService.currentTenantValue.userId;
    this.getTenants();

  }
  getTenants() {
    this.tenantService.currentTenant
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (tenant) => {
          this.tenants = tenant;
          if (tenant.tenantId === undefined) {
            return;
          } else if (
            !tenant.hasOwnProperty("tenantId") ||
            !tenant.hasOwnProperty("userId")
          ) {
            return;
          } else {
            this.getAppsList();
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  getAppsList() {
    this.appService
      .getAppsList()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (data) => {
          if (data) {
            const apps = data;
            apps.forEach((element) => {
              this.showSpinner = true;
              const appName = element.appName;
              const appId = element.id;
              this.appNames.push(appName);
              this.appIds.push(appId);
            });
            if (this._utility.lic === "BMS") {
              this.getAppDetails("Trend");
            } else {
              this.getAppDetails(this.appNames[0]);
            }
            console.log("success");
          }
        },
        (err) => {
          this.showSpinner = false;
          this.toastrService.error("Failed to get Apps list");
        }
      );
  }
  getAppDetails(appName: string) {
    const index = this.appNames.indexOf(appName);
    this.selectedAppIndex = index;
    this.appId = this.appIds[this.appNames.indexOf(appName)];
    this._utility.appID = this.appId;
    this._utility.appName = appName;
    this.showTransformers = true;
    this.showSpinner = false;
    this._utility.isReportList = true;
    this._utility.isCreateReport = false;
    console.log(`appId = ${this.appId}`);
  }
  showTransformer() {
    this.showSpinner = true;
    this._utility.reportFormat = "HTML4.0";
    this._utility.reportData = "";
    this._utility.isReportRun = false;
    this._utility.isRunFeatures = false;
    this.utility.entitySelected = "Transformers";
    this._utility.Transpage = this.router.url;
    this._utility.userID = this.tenantService.currentTenantValue.userId;
    this.selectedTabIndex = 1;
    this._utility.Transformerdatasource = "Transformer";
    localStorage.setItem("selectedTabIndex", this.selectedTabIndex.toString());
    this.getTenants();
  }
  showImporter() {
    this.showSpinner = true;
    this._utility.reportFormat = "HTML4.0";
    this._utility.reportData = "";
    this._utility.isReportRun = false;
    this._utility.isRunFeatures = false;
    this.utility.entitySelected = "Importer";
    this._utility.Transpage = this.router.url;
    this._utility.userID = this.tenantService.currentTenantValue.userId;
    this.selectedTabIndex = 0;
    localStorage.setItem("selectedTabIndex", this.selectedTabIndex.toString());
    this.getTenants();
  }
  showExporter() {
    this.showSpinner = true;
    this._utility.reportFormat = "HTML4.0";
    this._utility.reportData = "";
    this._utility.isReportRun = false;
    this._utility.isRunFeatures = false;
    this.utility.entitySelected = "Exporter";
    this._utility.Transpage = this.router.url;
    this._utility.userID = this.tenantService.currentTenantValue.userId;
    this.selectedTabIndex = 2;
    this._utility.Transformerdatasource = "Exporter";
    localStorage.setItem("selectedTabIndex", this.selectedTabIndex.toString());
    this.getTenants();
  }
  showMaintainer() {
    this.showSpinner = true;
    this._utility.reportFormat = "HTML4.0";
    this._utility.reportData = "";
    this._utility.isReportRun = false;
    this._utility.isRunFeatures = false;
    this.utility.entitySelected = "Maintainer";
    this._utility.Transpage = this.router.url;
    this._utility.userID = this.tenantService.currentTenantValue.userId;
    this.selectedTabIndex = 3;
    this._utility.Transformerdatasource = "Maintainer";
    localStorage.setItem("selectedTabIndex", this.selectedTabIndex.toString());
    this.getTenants();
  }
  onTabChange(event: MatTabChangeEvent) {
    console.log('Tab changed', event);
    switch (event.index) {
      case 0:
        this.updateFragmentIdentifier('tab0');
        this._utility.isbreadEditReport = false;
        this.showImporter();
        break;
      case 1:
        this.updateFragmentIdentifier('tab1');
        this._utility.isbreadEditReport = false;
        this.showTransformer();
        break;
      case 2:
        this.updateFragmentIdentifier('tab2');
        this._utility.isbreadEditReport = false;
        this.showExporter();
        break;
      case 3:
        this.updateFragmentIdentifier('tab3');
        this._utility.isbreadEditReport = false;
        this.showMaintainer();
        break;
      default:
        break;
    }
  }

  updateFragmentIdentifier(queryParam: string) {
    // Update the URL fragment identifier
    this.router.navigate([], { queryParams: { tab: queryParam }, relativeTo: this.route });
  }

  createReport() {
    if (this._utility.licenseInfo.isLimitedEdition) {
      this._rptService.checkDeviceLimitOnInstance().subscribe(
        (isWithinDeviceLimit: boolean) => {
          let message = "";

          if (!isWithinDeviceLimit) {
            message = "You have reached the maximum number of devices allowed under your current license. To continue creating or editing reports, you need to update your license to allow more devices.<br/> Please contact LogicMatter at <b>support@logicmatter.com</b>";
          } else

          {
          //   if (this._utility.reportsList.length >= this._utility.licenseInfo.reportLimit) {
          //   message = "Reached the report creation limit in this Edition.<br/> Please contact LogicMatter at <b>support@logicmatter.com</b>";
          // }

          // else{
            Object.assign(this._utility, {
              selectedItems: [],
              isObjectSelection: false,
              isReportRun: false,
              isRunFeatures: false,
              toggle: false,
              isClickedToggle: false,
              mainWidthToggle: false,
              isConfigure: false,
              isReportList: false,
              isCreateReport: true,
              reportData: undefined,
              reportID: "",
              Transpage: this.router.url,
              userID: this.tenantService.currentTenantValue.userId,
            });

            this._Adhocutility.checkedList = [];
          }
          // }

          if (message) {
            this.dialog.open(DeleteDialog, {
              width: "390px",
              data: { id: 0, type: "", message, action: "Warning", title: "⚠️ Notice" },
            });
            return;
          }
        },
        (error) => console.error("Error checking device limit:", error)
      );
    }
  else{
    Object.assign(this._utility, {
      selectedItems: [],
      isObjectSelection: false,
      isReportRun: false,
      isRunFeatures: false,
      toggle: false,
      isClickedToggle: false,
      mainWidthToggle: false,
      isConfigure: false,
      isReportList: false,
      isCreateReport: true,
      reportData: undefined,
      reportID: "",
      Transpage: this.router.url,
      userID: this.tenantService.currentTenantValue.userId,
    });

    this._Adhocutility.checkedList = [];
  }
  }


  CopyTrans() {
    if(this.selectedTabIndex === 0){
      this.showSpinner = true
    const userId = this.tenantService.currentTenantValue.userId
    const tenantId = this.tenantService.currentTenantValue.tenantId
    this._service.SaveMasterDataSource(tenantId, userId).subscribe(
      () => { },
      (error) => {
        const { status, error: errorMessage } = error;
        status === 200
          ? (this._rptService.showSuccess(errorMessage.text))
          : status === 500
            ? (this._rptService.showError(errorMessage))
            : (this._rptService.showError("Failed To Copy DataSources"));
        this.showSpinner = false;
      }
    );

    }
    else
    {this.showSpinner = true
      const userId = this.tenantService.currentTenantValue.userId
      const tenantId = this.tenantService.currentTenantValue.tenantId
      this._rptService.SaveMasterReport(tenantId, userId).subscribe(data => {
      },
        error => {
          if (error.status == 200) {
            this._rptService.showSuccess(error.error.text);
            this.showSpinner = false
          }
          else {
            const entityName = this.getEntityNameByTabIndex(this.selectedTabIndex);
            this._rptService.showError(`Failed To Copy ${entityName}`);
            this.showSpinner = false
          }
        }
      );}
  }

  Initialisation()
  {
    if(this.selectedTabIndex === 0)
    {
      this.showSpinner = true
    const userId = this.tenantService.currentTenantValue.userId
    const tenantId = this.tenantService.currentTenantValue.tenantId
    this._service.CreatePredefinedDataSource(tenantId, userId ).subscribe(
      () => { },
      (error) => {
        const { status, error: errorMessage } = error;
        status === 200
          ? (this._rptService.showSuccess(errorMessage.text))
          : status === 500
            ? (this._rptService.showError(errorMessage))
            : (this._rptService.showError("Failed To Initialise DataSources"));
        this.showSpinner = false;
      }
    );
    }
    else
    {
      this.showSpinner = true
      const userId = this.tenantService.currentTenantValue.userId
      const tenantId = this.tenantService.currentTenantValue.tenantId
      const TabName = this.getEntityNameByTabIndex(this.selectedTabIndex);
      this._rptService.CreatePredefinedReports(tenantId, userId, TabName).subscribe(data => {
      },
        error => {
          if (error.status == 200) {
            this._rptService.showSuccess(error.error.text);
            this.showSpinner = false
          }
          else {
            const entityName = this.getEntityNameByTabIndex(this.selectedTabIndex);
            this._rptService.showError(`Failed To Initialise ${entityName}`);
            this.showSpinner = false
          }
        }
      );

    }
  }
  getEntityNameByTabIndex(selectedTabIndex: number): string {
    switch (selectedTabIndex) {
        case 0:
            return "Importers";
        case 1:
            return "Transformers";
        case 2:
            return "Exporters";
        case 3:
            return "Maintainers";
        default:
            return "Unknown Entity";
    }
}

  navigate1() {
    localStorage.selectedTabIndex = 0;
    this.router.navigateByUrl("home/flow");
  }

  ngAfterViewInit() { }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
