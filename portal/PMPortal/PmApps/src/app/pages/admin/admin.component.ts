import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { UserService } from './../../PmCore/services/UserService/UserService.service';
import { TenantService } from './../../PmCore/services/TenantService/TenantService.service';
import { ReportUserModel } from 'src/app/PmModel/ReportUserModel';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModel } from 'src/app/PmModel/common.model';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
import { AppUtilService, DeleteDialog } from "src/app/PmCore/shared/app-util.service";
import { AppRoutes } from '../apps/app-routes.enum';
import { ReportingService } from 'src/app/PmCore/services';
import { AuthGuard } from 'src/app/guards/auth-guard.service';
import { SchedulerService } from 'src/app/PmCore/services/SchedulerService/scheduler.service';
import { ScheduledFilesDialogComponent } from 'src/app/core/scheduled-files-dialog/scheduled-files-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UtilityService } from 'src/app/PmCore/services/utility.service';
import { ToolbarComponent } from 'src/app/layout';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, AfterViewInit {
  @ViewChild('tabGroup', { static: true }) tabGroup;
  // MatPaginator Inputs
  length1;
  pageSize = 10;
  currentPageSize = 10;
  pageSizeOptions1: number[] = [5, 10, 25, 100];
  displayedColumns = ['SNo', 'firstName', 'lastName', 'roles', 'tenant', 'email', 'isActive', 'actions'];
  displayedColumnsrep = ['appName', 'reportName', 'createdBy', 'lastModifiedOn', 'ac']
  page = 0;
  size = 10;
  userList = new MatTableDataSource();
  reportsList = new MatTableDataSource();
  @ViewChild(MatPaginator, { static: false }) userPaginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) userSort: MatSort;

  @ViewChild('reportPaginator', { static: false }) reportPaginator: MatPaginator;
  @ViewChild('reportSort', { static: false }) reportSort: MatSort;
  // MatPaginator Output
  pageEvent: PageEvent;
  startingIndex: number;
  endingIndex: any;
  userObj: any = {
    firstName: '',
    lastName: '',
    email: '',
    isActive: '',
    roles: '',

  };
  filter: any;
  key: string;
  key1: string;
  showSpinner: boolean = true;
  length = 1;
  //pageSize = 2;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  usersList = [];

  tabId: number = 0;
  rptUserModel: ReportUserModel = new ReportUserModel();
  p: number = 1;
  p1: number = 1;
  public routesEnum = AppRoutes;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  config: { currentPage: number; itemsPerPage: number };
  reverse: boolean;
  reverse1: boolean;
  routeUrl: string;
  tenants: unknown;
  previousTenant: string;
  rptList: any;
  usrList: any;
  type: any;
  sort(key: string) {
    if (key !== '') {
      this.key = key;
      this.reverse = !this.reverse;
    }
  }
  sort1(key1: string) {
    if (key1 !== '') {
      this.key1 = key1;
      this.reverse1 = !this.reverse1;
    }
  }
  constructor(
    private userService: UserService,
    public tenantService: TenantService,
    public coreService: CoreUtilityService,
    private utilityService: UtilityService,
    public utility: UtilityService,
    private _rptService: ReportingService,
    private schedulerService: SchedulerService,
    public _utility: AppUtilService,
    public toastr: ToastrService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private authGaurd: AuthGuard,
    private cdr: ChangeDetectorRef,
    public _toolbar: ToolbarComponent,) {
    this.coreService.filter = "";
    this.config = {
      currentPage: 1,
      itemsPerPage: 10
    };
  }

  ngOnInit() {
    var mastertenantValue = localStorage.getItem('mastertenant');
    if (mastertenantValue == "true") {
      localStorage.setItem('mastertenant', 'false');
      this.tenantService.triggerTenantSelected(this._utility.tenantId);
    }
    this._toolbar.enablebutton();

    if (localStorage.getItem('ItemPerPage') !== null) {
      this.currentPageSize = +localStorage.getItem('ItemPerPage');
      this.size = +localStorage.getItem('ItemPerPage');
    }
    else {
      this.currentPageSize = 10;
      this.size = 10;
    }
    this._utility.showSpinner = false;
    this.userList = new MatTableDataSource();
    this.reportsList = new MatTableDataSource();
    this.reportsList.paginator = this.reportPaginator
    this.userObj.roles = this.userService.getLoginUserRoles();
    this.utility.entitySelected = "Reports";
    this.getTenants();
  }
  getTenants() {
    this.tenantService.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      tenant => {
        this.tenants = tenant;
        if (tenant === undefined) {
          return;
        } else if (!tenant.hasOwnProperty("tenantId") || !tenant.hasOwnProperty("userId")) {
          return;
        }
        this.userList = new MatTableDataSource();
        this.reportsList = new MatTableDataSource();
        this.reportsList.paginator = this.reportPaginator
        this.userObj.roles = this.userService.getLoginUserRoles();
        this._utility.tenantID = tenant.tenantId;
        // if(this.tenantService.currentTenantValue.tenantName != this._utility.previousTenant) {
        this._utility.previousTenant = this.tenantService.currentTenantValue.tenantName;
        this._utility.tenantID = tenant.tenantId;
        this._utility.reportData = '';
        this._utility.isReportRun = false;
        this._utility.isConfigure = false;
        this._utility.isReportList = true;
        this._utility.isCreateReport = false;
        this._utility.isRunFeatures = false;
        this.coreService.filter = '';
        this._utility.rptObj = '';
        this._utility.reportID = '';

        //   this.routeUrl = this.routesEnum[this._utility.appName.toLocaleLowerCase()] + '/' + this._utility.appID;
        //   this.router.navigateByUrl(this.routeUrl);
        // }
        this.route.queryParams.subscribe(p => {
          this.tabId = (this.route.snapshot.queryParams['tabId']) ? this.route.snapshot.queryParams['tabId'] : 0;
          this.tabGroup.selectedIndex = this.tabId;
          if (this.tabId == 0) {
            this.getUsersList();
          } else {
            this.getReportsList();
          }
        });

      }, err => {
        console.log(err);
      });
  }


  ngAfterViewInit() {
    this.tabGroup.selectedIndex = this.tabId;
    this.userList.paginator = this.userPaginator;
    this.userList.sort = this.userSort;
    this.reportsList.paginator = this.reportPaginator;
    this.reportsList.sort = this.reportSort;
  }


  getUsersList() {
    this.coreService.filter = "";
    this.showSpinner = true;
    this.length = 1;
    this.userService.getUsersList().subscribe(resp => {
      setTimeout(() => {
        this.userList.data = resp;
        this.length = this.userList.data.length;
        this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size });
        this.userList.paginator = this.userPaginator;
        this.userList.sort = this.userSort;
        if (this.userList.data.length > 0) {
          var index = this.userList.data.findIndex(u => (u['id'] === this.tenantService.currentTenantValue.userId));
          this.userList.data.splice(index, 1);
          this.userList = new MatTableDataSource(this.userList.data);
          this.userList.paginator = this.userPaginator;
          this.userList.sort = this.userSort;
          this.cdr.detectChanges();
        }
        //  this.sort.Usersort(({ id: 'sid', start: 'asc' }) as MatSortable);
      });
      this.showSpinner = false;
    });
  }

  getReportAccessUsers(rptObj) {
    this.router.navigate(['home/admin/report-users/' + rptObj.appId + '/' + rptObj.reportId]);
  }
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.reportsList.filter = filterValue;
  }
  applyFilter1(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.userList.filter = filterValue;
  }
  getUserAccessReports(userId) {
    const type = "Assignreports";
    this.router.navigate(['home/admin/user-reports/' + type + '/' + userId]);
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

  getReportsList() {
    this.showSpinner = true;
    this.coreService.filter = "";
    this.rptUserModel.reportType = 'Report'
    this.rptUserModel.tenantId = this.tenantService.currentTenantValue.tenantId;
    this.rptUserModel.userId = this.tenantService.currentTenantValue.userId;
    this.userService.getUserReportsList(this.rptUserModel).subscribe(resp => {
      if (resp) {
        setTimeout(() => {

          this.reportsList.data = resp.userReports;
          //this.reportsList.data.forEach(s => (s["checked"] = false));
          if (this.reportsList.data == null) {
            this.length = 0;
          }

          else {
            this.length = this.reportsList.data.length;

            this.reportsList.paginator = this.reportPaginator;
            this.reportsList.sort = this.reportSort;
            this.getData({ pageIndex: this.page, pageSize: this.size });
          }
        });
      }
      else {
        this.reportsList = new MatTableDataSource([]);
        this.length = 0;
      }

      this.showSpinner = false;

    },
      error => {
        this.showSpinner = false;
        this.reportsList = new MatTableDataSource([]);
        this.length = 0;
        return;
      });
  }



  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { tabId: tabChangeEvent.index } });
    setTimeout(() => {
      switch (tabChangeEvent.index) {
        case 0:
          !this.userList.paginator ? this.userList.paginator = this.userPaginator : null;
          break;
        case 1:
          !this.reportsList.paginator ? this.reportsList.paginator = this.reportPaginator : null;
      }
    });
  }
  changeUserStatus(userObj) {
    userObj.isActive = !userObj.isActive;
    this.userService.updateUserStatus(userObj.id).subscribe(resp => {
      if (resp) {
        this.getUsersList();
      }
    });
  }
  schedule(rpt) {
    this.showSpinner = true;
    this.type = "AdminComponent";
    if (rpt.scheduleId == null || rpt.scheduleId == '' || rpt.scheduleId == undefined) { rpt.scheduleId = 'new' }
    this.router.navigateByUrl("/home/scheduler/" + this.type + "/" + rpt.appId + "/" + rpt.templateId + "/" + rpt.reportId + "/" + rpt.scheduleId);
  }
  getScheduledFiles(rpt) {
    this.rptUserModel.appId = rpt.appId;
    this.rptUserModel.reportId = rpt.reportId;
    this.rptUserModel.templateId = rpt.templateId;
    this.rptUserModel.tenantId = this.tenantService.currentTenantValue.tenantId;
    this.schedulerService.getReportsScheduledFiles(this.rptUserModel).subscribe(resp => {
      if (resp.status) {
        this.toastr.error(resp.message);
      } else {
        const dialogRef = this.dialog.open(ScheduledFilesDialogComponent, {
          width: "390px",
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
  editReport(obj) {
    // if (this._utility.licenseInfo.isLimitedEdition) {
    //   this._rptService.checkDeviceLimitOnInstance().subscribe(
    //     (response: boolean) => {
    //       if (!response) {
    //         this.dialog.open(DeleteDialog, {
    //           width: "390px",
    //           data: {
    //             id: 0,
    //             type: "",
    //             message: "You have reached the maximum number of devices allowed under your current license. To continue creating or editing reports, you need to update your license to allow more devices.<br/> Please contact LogicMatter at <b>support@logicmatter.com</b>",
    //             action: "Warning",
    //             title: "⚠️ Notice",
    //           },
    //         });
    //         return;
    //       }
    //       else{
    //         this._utility.appName = obj.normalizedAppName;
    //         this._utility.isUpdate = true;
    //         this._utility.validTemplateForm = false;
    //         this._utility.isObjectSelection = false;
    //         this._utility.isGrafana = false;
    //         this._utility.isGrafanaedit = true;
    //         this._utility.hasPreview = false;
    //         this._utility.isReportRun = false;
    //         this._utility.isRunFeatures = false;
    //         //console.log("----id---", id);
    //         this._utility.isReportRun = false;
    //         this._utility.toggle = false;
    //         this._utility.isClickedToggle = false;
    //         this._utility.mainWidthToggle = false;
    //         this._utility.reportID = obj.reportId;
    //         this._utility.isReportList = false;
    //         this._utility.isCreateReport = true;
    //         this._utility.templateID = obj.templateId;
    //         this.routeUrl =
    //           this.routesEnum[obj.normalizedAppName] +
    //           "/" +
    //           obj.appId +
    //           "/" +
    //           obj.reportId +
    //           "/edit";
    //         this.router.navigateByUrl(this.routeUrl);
    //       }
    //     },
    //     error => console.error("Error checking device limit:", error)
    //   );
    // }
    // else{
    this._utility.appName = obj.normalizedAppName;
    this._utility.isUpdate = true;
    this._utility.validTemplateForm = false;
    this._utility.isObjectSelection = false;
    this._utility.isGrafana = false;
    this._utility.isGrafanaedit = true;
    this._utility.hasPreview = false;
    this._utility.isReportRun = false;
    this._utility.isRunFeatures = false;
    //console.log("----id---", id);
    this._utility.isReportRun = false;
    this._utility.toggle = false;
    this._utility.isClickedToggle = false;
    this._utility.mainWidthToggle = false;
    this._utility.reportID = obj.reportId;
    this._utility.isReportList = false;
    this._utility.isCreateReport = true;
    this._utility.templateID = obj.templateId;
    this.routeUrl =
      this.routesEnum[obj.normalizedAppName] +
      "/" +
      obj.appId +
      "/" +
      obj.reportId +
      "/edit";
    this.router.navigateByUrl(this.routeUrl);
  // }
  }
  runReport(rpt) {
    this._utility.appName = rpt.normalizedAppName;
    this._utility.isUpdate = true;
    this._utility.validTemplateForm = false;
    this._utility.isObjectSelection = false;
    this._utility.templateID = rpt.templateId;
    this._utility.isObjectSelection = false;
    this._utility.toggle = false;
    this._utility.isClickedToggle = false;
    this._utility.mainWidthToggle = false;
    this._utility.reportData = "";
    this._utility.isReportRun = true;
    //this._utility.isRunFeatures = true;
    this._utility.newReport = false;
    this._utility.totalNoPages = "";
    this._utility.isCreateReport = true;
    this._utility.isReportList = false;
    this._utility.isUpdate = true;
    this._utility.reportID = rpt.reportId
    var routeUrl =
      this.routesEnum[rpt.normalizedAppName] +
      "/" +
      rpt.appId +
      "/" +
      rpt.reportId +
      "/run";
    this.router.navigateByUrl(routeUrl);
  }
  deleteReport(id) {
    this._rptService.deleteReport(id, this.tenantService.currentTenantValue.tenantId).subscribe(
      data => {
        this._rptService.showSuccess("Deleted Successfully");
        this.getReportsList()
      },
      error => {
        this._rptService.showError("Error : Something went wrong.");
      }
    );
  }
  userActiveDialog(evt, obj): void {
    const dialogRef = this.dialog.open(DeleteDialog, {
      width: "390px",
      data: { id: 0, type: "", message: 'Are you sure, you want to change the account status of <b>' + obj.email + '</b> ?', action: 'Yes' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true) {
        this.changeUserStatus(obj);
      } else {
        evt.source.checked = obj.isActive;
      }
    });
  }
  deleteReportDialog(evt, reportObj): void {
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
        } else {
        }
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
  editUser(userObj) {
    // if (this._utility.licenseInfo.isLimitedEdition) {
    //   const dialogRef = this.dialog.open(DeleteDialog, {
    //     width: "390px",
    //     data: {
    //       id: 0,
    //       type: '',
    //       message: "This feature is not available in this Edition. <br/>Please contact LogicMatter at <b>support@logicmatter.com</b>",
    //       action: "Warning",
    //       title: "Info"
    //     }
    //   });
    // } else {
      const type = "Editusers";
      this.router.navigate(['/home/admin/user/' + type + '/' + userObj.id]);
    // }
  }
  createNewUser() {

    // if (this._utility.licenseInfo.isLimitedEdition) {
    //   const dialogRef = this.dialog.open(DeleteDialog, {
    //     width: "390px",
    //     data: {
    //       id: 0,
    //       type: '',
    //       message: "This feature is not available in this Edition. <br/>Please contact LogicMatter at <b>support@logicmatter.com</b>",
    //       action: "Warning",
    //       title: "Info"
    //     }
    //   });
    // } else {
      const type = "Createusers";
      this.router.navigate(['/home/admin/user/' + type + '/-1']);
    // }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
