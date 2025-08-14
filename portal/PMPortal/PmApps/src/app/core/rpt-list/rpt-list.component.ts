import { Router, ActivatedRoute } from "@angular/router";
import { Component, OnInit, Input, ViewChild, ChangeDetectorRef } from "@angular/core";
import {
  ReportingService,
  SearchServiceService,
  TenantService
} from "src/app/PmCore/services";
import { MatDialog } from "@angular/material/dialog";
import { MatSort } from "@angular/material/sort";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { CoreUtilityService } from "src/app/PmCore/shared/core-utility.service";
import {
  AppUtilService,
  DeleteDialog
} from "src/app/PmCore/shared/app-util.service";
import { takeUntil } from "rxjs/operators";
import { UtilityService } from "src/app/PmCore/services/utility.service";
import { Search } from "src/app/PmModel/search.model";
import { Subject } from "rxjs";
import { AppRoutes } from "src/app/pages/apps/app-routes.enum";
import { RoleguardService } from "src/app/guards/roleguard.service";
import { AuthGuard } from "src/app/guards/auth-guard.service";
import { ReportUserModel } from 'src/app/PmModel/ReportUserModel';
import { SchedulerService } from 'src/app/PmCore/services/SchedulerService/scheduler.service';
import { ToastrService } from 'ngx-toastr';
import { ScheduledFilesDialogComponent } from '../scheduled-files-dialog/scheduled-files-dialog.component';
import { CommonModel } from 'src/app/PmModel/common.model';
import { SearchUtilityService } from 'src/app/pages/search/search-utility.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ReportObj } from "src/app/PmModel/ReportObj";
@Component({
  selector: "app-rpt-list",
  templateUrl: "./rpt-list.component.html",
  styleUrls: ["./rpt-list.component.scss"]
})
export class RptListComponent implements OnInit {
  // MatPaginator Inputs
  public reportObj: ReportObj = new ReportObj();
  length: number;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  page = 0;
  size = 10;
  // MatPaginator Output
  pageEvent: PageEvent;
  length1: number;
  size1: 0;
  page1: 10;
  currentPageSize = 10;
  displayedColumns = ['appName', 'reportName', 'createdBy', 'lastModifiedOn', 'actions'];
  displayedColumns1 = ['appName', 'reportName', 'createdBy', 'lastModifiedOn', 'actions'];
  appRptList = new MatTableDataSource();
  searchRptList = new MatTableDataSource();
  @ViewChild(MatPaginator, { static: false }) searchRptPaginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) searchRptSort: MatSort;
  selectedFilter: any;
  rptValues: void;
  type: any;

  @ViewChild('appRptPaginator', { static: false })
  set appRptPaginator(value: MatPaginator) {
    if (this.appRptList) {
      this.appRptList.paginator = value;
    }
  }
  @ViewChild('appRptSort', { static: false })
  set appRptSort(value: MatSort) {
    if (this.appRptList) {
      this.appRptList.sort = value;
    }
  }

  public routesEnum = AppRoutes;
  //searchRpt: string = "";
  // @Input("appID") appID: string;
  // @Input("userID") userID: string;
  // @Input("tenantID") tenantID: string;
  showSpinner: boolean;
  _searchModelInput: any;
  routeUrl: string;
  maxRecords: any;
  previousTenant: string;
  tenants: CommonModel;
  reportList: any;
  startingIndex: number;
  endingIndex: any;
  startingIndex1: number;
  endingIndex1: any;
  // @Input() public searchModelInput;
  @Input() set searchModelInput(searchModelInput: string) {
    this._searchModelInput = searchModelInput;
    this.getReportList();
  }
  ngUnsubscribe: Subject<void> = new Subject<void>();
  public model: Search = new Search();
  searchList: any;
  key: string;
  reverse: boolean;
  filter;
  showPlot: boolean;
  count: any;
  p1: number;
  collectionSize: any;
  tests: { id: number; items: string[] }[];
  config: { currentPage: number; itemsPerPage: number };
  selectedItems = {};
  searchFlag: boolean;
  reportFlag: boolean;
  filterValue: any;
  rptUserModel: ReportUserModel = new ReportUserModel();
  filterTypes = [];
  isButtonClicked: boolean = false;
  constructor(
    private _route: Router,
    private _rptService: ReportingService,
    public _utility: AppUtilService,
    public dialog: MatDialog,
    public coreService: CoreUtilityService,
    public utility: UtilityService,
    public toastr: ToastrService,
    private search: SearchServiceService,
    private schedulerService: SchedulerService,
    private tenantService: TenantService,
    private authGaurd: AuthGuard,
    public route: ActivatedRoute,
    public searchUtility: SearchUtilityService,
    private cdr: ChangeDetectorRef
  ) {
    this.filterTypes = [
      { name: "Reports", value: "Reports" },
      { name: "Transformers", value: "Transformers" }
    ];
    this.coreService.filter = "";
    this.config = {
      currentPage: 1,
      itemsPerPage: 10
    };
    this.selectItem(this.coreService.maxRecords, 1);
  }

  ngOnInit() {

    console.log(this.filterTypes);

    if (this._searchModelInput === undefined) {
      if (this.utility.entitySelected != null && (this.utility.entitySelected == "Reports" || this.utility.entitySelected == "Transformers" || this.utility.entitySelected == "Importer" || this.utility.entitySelected == "Exporter" || this.utility.entitySelected == "Maintainer")) {
        this.selectedFilter = this.utility.entitySelected;
      }
      else {
        this.selectedFilter = this.filterTypes[0].value;
        this.utility.entitySelected = this.selectedFilter;
      }

    }
    else {
      this.selectedFilter = this.utility.entitySelected;
    }


    if (localStorage.getItem('ItemPerPage') !== null) {
      this.currentPageSize = +localStorage.getItem('ItemPerPage');
      this.size = +localStorage.getItem('ItemPerPage');
    }
    else {
      this.currentPageSize = 10;
      this.size = 10;
    }
    this.appRptList = new MatTableDataSource();
    this.appRptList.paginator = this.appRptPaginator;
    this.searchRptList = new MatTableDataSource();
    this.searchRptList.paginator = this.searchRptPaginator;
    this.getTenants();
    this._utility.reportData = "";
    this._utility.isReportRun = false;
    this._utility.isRunFeatures = false;

  }
  getData(obj) {
    if (localStorage.getItem('ItemPerPage') !== null) {
      if (parseInt(localStorage.getItem('ItemPerPage')) == obj.pageSize) {
        this.currentPageSize = +localStorage.getItem('ItemPerPage');
      }
      else {
        localStorage.setItem('ItemPerPage', obj.pageSize.toString());
        this.currentPageSize = obj.pageSize;
      }
    }
    else {
      localStorage.setItem('ItemPerPage', obj.pageSize.toString());
      this.currentPageSize = obj.pageSize;
    }
    let index = 0
    this.startingIndex = obj.pageIndex * obj.pageSize,
      this.endingIndex = this.startingIndex + obj.pageSize;
  }
  getData1(obj) {
    let index = 0;
    this.startingIndex = obj.pageIndex * obj.pageSize,
      this.endingIndex = this.startingIndex + obj.pageSize;
  }
  // getTenants() {
  //   this.tenantService.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
  //     tenant => {
  //       this.tenants = tenant;
  //       if (tenant === undefined) {
  //         return;
  //       }
  //         this._utility.tenantID = tenant.tenantId;
  //         this.coreService.filter = '';
  //         if (this._route.url.indexOf("run") > 0 || this._route.url.indexOf("edit") > 0) {
  //            this.routeUrl =
  //         this.routesEnum[this._utility.appName] +
  //         "/" +
  //         this._utility.appID;
  //       this._route.navigateByUrl(this.routeUrl);
  //       }
  //       this.getReportList();
  //     }, err => {
  //       console.log(err);
  //     });
  // }
  getTenants() {
    this.tenantService.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      tenant => {
        this.tenants = tenant;
        if (tenant.tenantId === undefined) {
          return;
        }
        this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
        this.model.userId = this.tenantService.currentTenantValue.userId;
        this._utility.userID = this.tenantService.currentTenantValue.userId;
        if (this.tenantService.currentTenantValue.tenantName != this._utility.previousTenant) {
          this._utility.previousTenant = this.tenantService.currentTenantValue.tenantName;
          this._utility.tenantID = tenant.tenantId;
          if (this._route.url.indexOf("search") > 0) {
            this.getReportList();
          } else {
            this._utility.reportData = '';
            this._utility.isReportRun = false;
            this._utility.isConfigure = false;
            this._utility.isReportList = true;
            this._utility.isCreateReport = false;
            this._utility.isRunFeatures = false;
            this.coreService.filter = '';
            this._utility.rptObj = '';
            this._utility.reportID = '';
            if (this._utility === undefined) {
              if (this._utility.appName) {
                this.routeUrl = this.routesEnum[this._utility.appName.toLowerCase()] + '/' + this._utility.appID;
                this._route.navigateByUrl(this.routeUrl);
              }
            }
            else {
              this.getReportList();
            }
          }

        }
        else {
          if (this._route.url.indexOf("run") > 0 || this._route.url.indexOf("edit") > 0) {
            this.routeUrl = this.routesEnum[this._utility.normalizedAppName.toLowerCase()] + "/" + this._utility.appID;
            this._route.navigateByUrl(this.routeUrl);
          }
          else {
            this._utility.rType = "Transformers";
            this.getReportList();
          }
        }
        //
      }, err => {
        console.log(err);
      });
  }

  onChangeFilter(filterValue: string) {
    console.log(filterValue);
    if (this._route.url.indexOf("search") > 0) {
      if (filterValue == 'Reports') {
        this.selectedFilter = this.filterTypes[0].value;
        this.model.app = 'search';
        this.model.filter = false;
        this.model.tenantId = this._utility.tenantID;
        this.model.userId = this.tenantService.currentTenantValue.userId;
        this.model.objectType = filterValue;
        this.utility.entitySelected = filterValue;
        this._searchModelInput = this.model;
      }
      else {
        this.selectedFilter = this.filterTypes[1].value;
        this.model.app = 'search';
        this.model.filter = false;
        this.model.tenantId = this._utility.tenantID;
        this.model.userId = this.tenantService.currentTenantValue.userId;
        this.model.objectType = filterValue;
        this.utility.entitySelected = filterValue;
        this._searchModelInput = this.model;
      }
    }
    else {
      if (filterValue == 'Reports') {
        this.selectedFilter = this.filterTypes[0].value;
        this.utility.entitySelected = filterValue;
      }
      else {
        this.selectedFilter = this.filterTypes[1].value;
        this.utility.entitySelected = filterValue;
      }
    }

    this.getReportList();
  }
  getReportList() {
    this.reportList = '';
    this.filterValue = '';
    this.length = 0;
    this.length1 = 0;
    this.showSpinner = true;
    // Find the Search Sevice to get the report List
    if (this._searchModelInput) {
      if (this._route.url.indexOf("search") > 0) {
        console.log(this._searchModelInput);
        this.searchFlag = true;
        this.search
          .getSearchList(this._searchModelInput)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(data => {
            this.searchRptList = new MatTableDataSource(data.table);
            this._utility.reportsList = this.searchRptList.data;
            this.searchRptList.sort = this.searchRptSort;
            this.searchRptList.paginator = this.searchRptPaginator;
            this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size });
            this.length = this.searchRptList.data.length;
            this.showSpinner = false;

          });
      }
    } else {
      this.filterValue = [];
      this.collectionSize = [];
      this.searchFlag = false;
      this._rptService
        .getReportList(
          this._utility.userID,
          this._utility.appID,
          this._utility.tenantID,
          this.utility.entitySelected
        )
        .subscribe(
          data1 => {
            if(data1 == null)
              {
                this._utility.isTableHasDatasource = false;
              }
              else
              {
                this._utility.isTableHasDatasource = true;
              }
            if (data1) {
              this._utility.rptObj = data1;
              this.appRptList = new MatTableDataSource(data1);
              this.cdr.detectChanges();
              this._utility.reportsList = this.appRptList.data;
              this.length1 = this.appRptList.data.length;
              this.appRptList.paginator = this.appRptPaginator;
              this.appRptList.sort = this.appRptSort;
              this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size });
            }
            this.showSpinner = false;
          }, error => {
            this.showSpinner = false;
            console.log(error);
          });
    }
  }
  deleteReport(id) {
    this._rptService.deleteReport(id, this._utility.tenantID).subscribe(
      data => {
        this._rptService.showSuccess("Deleted Successfully");
        this.getReportList();
      },
      error => {
        this._rptService.showError("Error :" + error.error);
      }
    );
  }
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.searchRptList.filter = filterValue;
  }
  applyFilter1(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.appRptList.filter = filterValue;
  }
  getScheduledFiles(rpt) {
    // this._utility.appName = rpt.normalizedAppName;
    this.rptUserModel.tenantId = this.tenantService.currentTenantValue.tenantId;
    this.rptUserModel.userId = this.tenantService.currentTenantValue.userId;
    this.rptUserModel.appId = rpt.appId;
    this.rptUserModel.reportId = rpt.reportId;
    this.rptUserModel.templateId = rpt.templateId;
    this.schedulerService.getReportsScheduledFiles(this.rptUserModel).subscribe(resp => {
      if (resp.status) {
        this.toastr.error(resp.message);
      } else {
        const dialogRef = this.dialog.open(ScheduledFilesDialogComponent, {
          width: "90%",
          data: {
            'reportName': rpt.reportName,
            'appName': rpt.appName,
            'appId': rpt.appId,
            'reportId': rpt.reportId,
            'templateId': rpt.templateId,
            'scheduledFiles': resp
          }
        });
      }
    });
  }
  schedule(rpt) {
    // this._utility.appName = rpt.normalizedAppName;
    this.showSpinner = true;
    const path = this.route.routeConfig.path.split("/")[0];
    this.type = path.charAt(0).toUpperCase() + path.slice(1);

    if (
      rpt.scheduleId == null ||
      rpt.scheduleId == "" ||
      rpt.scheduleId == undefined
    ) {
      rpt.scheduleId = "new";
    }
    this._route.navigateByUrl(
      "/home/scheduler/" + this.type +
      "/" + rpt.appId +
      "/" + rpt.templateId +
      "/" + rpt.reportId +
      "/" + rpt.scheduleId
    );
  }

  editReport(obj) {
    // this._utility.appName = obj.normalizedAppName;
    if (this._utility.licenseInfo.isLimitedEdition) {
      this._rptService.checkDeviceLimitOnInstance().subscribe(
        (response: boolean) => {
          if (!response) {
            this.dialog.open(DeleteDialog, {
              width: "390px",
              data: {
                id: 0,
                type: "",
                message: "You have reached the maximum number of devices allowed under your current license. To continue creating or editing reports, you need to update your license to allow more devices.<br/> Please contact LogicMatter at <b>support@logicmatter.com</b>",
                action: "Warning",
                title: "⚠️ Notice",
              },
            });
            return;
          }
          else
          {
          this._utility.isUpdate = true;
          this._utility.validTemplateForm = false;
          this._utility.isObjectSelection = false;
          this._utility.hasPreview = false;
          this._utility.isRunFeatures = false;
          this._utility.isbreadEditReport = true;
          this._utility.isGrafana = false;
          this._utility.isGrafanaedit = true;
          //console.log("----id---", id);
          this._utility.isReportRun = false;
          this._utility.toggle = false;
          this._utility.isClickedToggle = false;
          this._utility.mainWidthToggle = false;
          this._utility.reportID = obj.reportId;
          this._utility.isReportList = false;
          this._utility.reportData = undefined;
          this._utility.isCreateReport = true;
          this._utility.newReport = false;
          this._utility.templateID = obj.templateId;
          //this._route.navigateByUrl("appCrEnv/listRpt");
          if (window.location.href.split("/").slice(-1)[0].includes("Transformers") == true) {
            if (this._searchModelInput) {
              if (this._route.url.indexOf("search") > 0) {
                this.routeUrl =
                  this.routesEnum[obj.normalizedAppName] +
                  "/" +
                  obj.appId +
                  "/" +
                  obj.reportId + "/edit";
                this._route.navigateByUrl(this.routeUrl);
              }
            }
          }
          else {
            this.routeUrl =
              this.routesEnum[obj.normalizedAppName] +
              "/" +
              obj.appId +
              "/" +
              obj.reportId +
              "/edit";
            this._route.navigateByUrl(this.routeUrl);
          }
        }

        },
        error => console.error("Error checking device limit:", error)
      );
    }
    else
    {
    this._utility.isUpdate = true;
    this._utility.validTemplateForm = false;
    this._utility.isObjectSelection = false;
    this._utility.hasPreview = false;
    this._utility.isRunFeatures = false;
    this._utility.isbreadEditReport = true;
    this._utility.isGrafana = false;
    this._utility.isGrafanaedit = true;
    //console.log("----id---", id);
    this._utility.isReportRun = false;
    this._utility.toggle = false;
    this._utility.isClickedToggle = false;
    this._utility.mainWidthToggle = false;
    this._utility.reportID = obj.reportId;
    this._utility.isReportList = false;
    this._utility.reportData = undefined;
    this._utility.isCreateReport = true;
    this._utility.newReport = false;
    this._utility.templateID = obj.templateId;
    //this._route.navigateByUrl("appCrEnv/listRpt");
    if (window.location.href.split("/").slice(-1)[0].includes("Transformers") == true) {
      if (this._searchModelInput) {
        if (this._route.url.indexOf("search") > 0) {
          this.routeUrl =
            this.routesEnum[obj.normalizedAppName] +
            "/" +
            obj.appId +
            "/" +
            obj.reportId + "/edit";
          this._route.navigateByUrl(this.routeUrl);
        }
      }
    }
    else {
      this.routeUrl =
        this.routesEnum[obj.normalizedAppName] +
        "/" +
        obj.appId +
        "/" +
        obj.reportId +
        "/edit";
      this._route.navigateByUrl(this.routeUrl);
    }
  }
}

  selectItem(item, id) {
    this.config.itemsPerPage = item;
    this.selectedItems[id] = item;
    // console.log(item);
    this.showSpinner = true;
    this.maxRecords = item;
    this.showSpinner = false;
  }

  isSelectedItem(item, id) {
    return this.selectedItems[id] && this.selectedItems[id] === item;
  }

  ngAfterViewInit() {
    this.appRptList.paginator = this.appRptPaginator;
    this.appRptList.sort = this.appRptSort;
    this.searchRptList.paginator = this.searchRptPaginator;
    this.searchRptList.sort = this.searchRptSort;
  }
  runReport(obj) {
    // this._utility.appName = obj.normalizedAppName;
    this._utility.isObjectSelection = false;
    this._utility.toggle = false;
    this._utility.isClickedToggle = false;
    this._utility.mainWidthToggle = false;
    this._utility.reportID = obj.reportId;
    this._utility.reportData = "";
    this._utility.isReportRun = true;

    //this._utility.isRunFeatures = true;
    this._utility.newReport = false;
    this._utility.totalNoPages = "";
    this._utility.isCreateReport = true;
    this._utility.isReportList = false;
    this._utility.templateID = obj.templateId;
    this._utility.isUpdate = true;
    if (window.location.href.split("/").slice(-1)[0].includes("Transformers") == true) {
      if (this._searchModelInput) {
        if (this._route.url.indexOf("search") > 0) {
          this.routeUrl =
            this.routesEnum[obj.normalizedAppName] +
            "/" +
            obj.appId +
            "/" +
            obj.reportId + "/run";
          this._route.navigateByUrl(this.routeUrl);
        }
      }
    }
    else {
      this.routeUrl =
        this.routesEnum[obj.normalizedAppName] +
        "/" +
        obj.appId +
        "/" +
        obj.reportId +
        "/run";
      this._route.navigateByUrl(this.routeUrl);
    }
  }

  saveReport(obj) {
    // if (this._utility.licenseInfo.isLimitedEdition) {
    //   this._rptService
    //     .getReportList(
    //       this._utility.userID,
    //       this._utility.appID,
    //       this._utility.tenantID,
    //       this._utility.rType
    //     )
    //     .pipe(takeUntil(this.ngUnsubscribe))
    //     .subscribe(
    //       data => {
    //         if (data) {
    //           if (data.length < this._utility.licenseInfo.reportLimit) {
    //             this.onSaveReport(obj);
    //           }
    //           // else {
    //           //   const dialogRef = this.dialog.open(DeleteDialog, {
    //           //     width: "390px",
    //           //     data: {
    //           //       id: 0,
    //           //       type: '',
    //           //       message: 'Reached the report creation limit in this Edition.<br/>  Please contact LogicMatter at <b>support@logicmatter.com</b>',
    //           //       action: "Warning",
    //           //       title: "Info"
    //           //     }
    //           //   });
    //           //   this._utility.btnLoading = false;
    //           //   return;
    //           // }
    //         }
    //         else {
    //           this.onSaveReport(obj);
    //         }
    //       }, err => {
    //         this._utility.btnLoading = false;
    //         this._rptService.showError('Failed to check report count');
    //       });
    // } else {
      this.onSaveReport(obj);
    // }

  }
  onSaveReport(obj) {
    this.reportObj.ReportName = obj.reportName;
    this._rptService.getReportParameterValue(obj.reportId, this._utility.tenantID).subscribe((data: any) => {
      this._utility.rptParamValues = data.reduce(
        (obj, item) => Object.assign(obj, { [item.parameterName]: item.parameterValue }), {});
      this.checkReportName();
      setTimeout(() => {
        let counter1 = 0;
        let counter = 0;
        if (this._utility.reportNameExists) {
          if (this.reportObj.ReportName.includes('copy')) {
            if (this.searchFlag) {
              this.searchRptList.data.forEach((element: any) => {
                if (element.reportName == this.reportObj.ReportName) {
                  counter1++;
                }
                if (element.reportName.includes(this.reportObj.ReportName)) {
                  counter++;
                }
              });
              if (counter1 == 1) {
                this.reportObj.ReportName += '_' + counter;
              }
            } else if (!this.searchFlag) {
              this.appRptList.data.forEach((element: any) => {
                if (element.reportName == this.reportObj.ReportName) {
                  counter1++;
                }
                if (element.reportName.includes(this.reportObj.ReportName)) {
                  counter++;
                }
              });
              if (counter1 == 1) {
                this.reportObj.ReportName += '_' + counter;
              }
            } else {
              const last = this.reportObj.ReportName[this.reportObj.ReportName.length - 1];
              const count = String(last) //check if valid integer
              if (count) {
                this.reportObj.ReportName = this.reportObj.ReportName.replace(/.$/, count + 2)
              } else {
                this.reportObj.ReportName += ' copy 1';
              }
            }
          } else {
            let counter = 0;
            if (this.searchFlag) {
              this.searchRptList.data.forEach((element: any) => {
                if (element.reportName.includes(this.reportObj.ReportName)) {
                  counter++;
                }
              });
              if (counter >= 0) {
                this.reportObj.ReportName += ' copy ' + counter;
              }
              console.log(`Counter: ${counter}`);
            }
            else {
              this.appRptList.data.forEach((element: any) => {
                if (element.reportName.includes(this.reportObj.ReportName)) {
                  counter++;
                }
              });
              if (counter >= 0) {
                this.reportObj.ReportName += ' copy ' + counter;
              }
              console.log(`Counter: ${counter}`);
            }

          }
        }
        this.reportObj.ReportDescription = obj.reportDescription;
        this.reportObj.AppId = obj.appId;
        this.reportObj.TemplateId = obj.templateId;
        this.reportObj.TenantId = this.tenantService.currentTenantValue.tenantId;
        this.reportObj.CreatedUserId = this._route.url.indexOf("search") > 0 ? obj.createdUserId : this._utility.userID;
        this.reportObj.ReportParams = JSON.stringify(this._utility.rptParamValues);
        this._rptService.saveReport(this.reportObj).subscribe(data => {
          this._utility.isReportList = true;
          this._utility.isCreateReport = false;
          this._utility.btnLoading = false;
          this._rptService.showSuccess("Duplicated Successfully");
          this.searchRptList = new MatTableDataSource();
          this.getReportList();
        }, error => {
          this._utility.btnLoading = false;
          console.log(error);
          this._rptService.showError("Error :" + error.error);
          this.getReportList();
        })
      }, 2500)

    }, error => {
    })

    console.log(this.reportObj);
  }

  checkReportName() {
    this._utility.reportNameExists = false;
    this._utility.hasReportNameValid = false;
    this._utility.isReportNameEmpty = false;

    if (this.reportObj.ReportName.toString().trim() === "") {
      this._utility.isReportNameEmpty = true;
      return;
    }

    // if(this.form.)

    if (
      this._utility.validateReportName(this.reportObj.ReportName.toString())
    ) {
      this._utility.hasReportNameValid = true;
      return;
    }
    this._rptService
      .checkReportName(this.reportObj.ReportName.trim(), this._utility.tenantID)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        data => {
          if (data[0]["count"] == 0) {
            this._utility.reportNameExists = false;
          } else {
            this._utility.reportNameExists = true;
          }
        },
        error => {
          console.log(error);
        }
      );
  }
  openDialog(reportObj): void {
    if (this.authGaurd.isAuthenticate.sub === reportObj.createdBy) {
      const dialogRef = this.dialog.open(DeleteDialog, {
        width: "390px",
        data: {
          id: 0,
          type: reportObj.reportName,
          message:
            "Are you sure, you want to delete this <b>" +
            reportObj.reportName +
            "</b>?",
          action: "Delete",
          title: "Warning"
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result == true) {
          this.deleteReport(reportObj.reportId);
          //console.log(result, "The dialog was closed");
        } else {
          //console.log(result, "The dialog was closed");
        }
        //this.deleteReport(id);
        ////console.log(result, "The dialog was closed");
        //this.animal = result;
      });
    } else {
      const dialogRef = this.dialog.open(DeleteDialog, {
        width: "390px",
        data: {
          id: 0,
          type: reportObj.reportName,
          message: "Report owner is only allowed to delete",
          action: "Warning",
          title: "Warning"
        }
      });
    }
  }
  filterByText(initial: string) {
    // console.log(this._utility.rptObj);
    if (initial === "") {
      this.filterValue = this._utility.rptObj;
    } else {
      if (this.filterValue == undefined) {
        this.filterValue = this._utility.rptObj;
      }
    }
    this.filterValue = this._utility.rptObj;
    this.filterValue = this.filterValue.filter(
      i =>
        i.reportName.toLowerCase().indexOf(initial.toLocaleLowerCase()) !==
        -1 ||
        i.reportDescription
          .toLowerCase()
          .indexOf(initial.toLocaleLowerCase()) !== -1
    );
    //console.log(this._utility.rptObj);
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
