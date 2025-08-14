import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ReportUserModel } from 'src/app/PmModel/ReportUserModel';
import { TenantService } from './../../../PmCore/services/TenantService/TenantService.service';
import { SchedulerService } from './../../../PmCore/services/SchedulerService/scheduler.service';
import { Router, ActivatedRoute } from '@angular/router'; import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CommonModel } from 'src/app/PmModel/common.model';
import { ToastrService } from 'ngx-toastr';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UtilityService } from 'src/app/PmCore/services/utility.service';
import { ToolbarComponent } from 'src/app/layout';
import { AppUtilService } from 'src/app/PmCore/shared/app-util.service';
@Component({
  selector: 'app-scheduler-reports-list',
  templateUrl: './scheduler-reports-list.component.html',
  styleUrls: ['./scheduler-reports-list.component.scss']
})
export class SchedulerReportsListComponent implements OnInit {
  @ViewChild('tabGroup', { static: true }) tabGroup;
  type: string;
  // @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  // @ViewChild(MatSort, { static: false }) sort:MatSort;
  @ViewChild('paginator', { static: false })
  set paginator(value: MatPaginator) {
    if (this.reportScheduleDataSource) {
      this.reportScheduleDataSource.paginator = value;
    }
  }

  @ViewChild('sort', { static: false })
  set sort(value: MatSort) {
    if (this.reportScheduleDataSource) {
      this.reportScheduleDataSource.sort = value;
    }
  }

  @ViewChild('paginator1', { static: false })
  set paginator1(value: MatPaginator) {
    if (this.flowScheduleDataSource) {
      this.flowScheduleDataSource.paginator = value;
    }
  }
  @ViewChild('sort1', { static: false })
  set sort1(value: MatSort) {
    if (this.flowScheduleDataSource) {
      this.flowScheduleDataSource.sort = value;
    }
  }

  @ViewChild('paginator2', { static: false })
  set paginator2(value: MatPaginator) {
    if (this.gatewayScheduleDataSource) {
      this.gatewayScheduleDataSource.paginator = value;
    }
  }
  @ViewChild('sort2', { static: false })
  set sort2(value: MatSort) {
    if (this.gatewayScheduleDataSource) {
      this.gatewayScheduleDataSource.sort = value;
    }
  }


  reportsScheduleList: any = [];
  flowScheduleList: any = [];
  GatewayScheduleList: any = [];
  flowScheduleDataSource = new MatTableDataSource();
  reportScheduleDataSource = new MatTableDataSource();
  gatewayScheduleDataSource = new MatTableDataSource();
  rptUserModel: ReportUserModel = new ReportUserModel();
  displayedColumns = ['appName', 'reportName', 'scheduleCreatedBy', 'scheduleModifiedBy', 'scheduleCreatedOn', 'scheduleStatus', 'lastRun', 'nextRun', 'actions'];
  displayedColumns1 = ['templateName', 'dataSourceName', 'dataSourceDescription', 'scheduleModifiedBy', 'scheduleCreatedOn', 'scheduleCreatedBy', 'scheduleStatus', 'lastRun', 'nextRun', 'actions'];
  displayedColumns2 = ['templateName', 'dataSourceName', 'dataSourceDescription', 'scheduleCreatedBy', 'scheduleModifiedBy', 'scheduleCreatedOn', 'scheduleStatus', 'lastRun', 'nextRun', 'actions'];
  showSpinner: boolean = false;
  key: string;
  reverse: boolean;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  tenants: CommonModel;
  previousTenant: string;
  startingIndex: number;
  endingIndex: any;
  startingIndex1: number;
  endingIndex1: any;
  startingIndex2: number;
  endingIndex2: any;
  p: number = 1;

  config: { currentPage: number; itemsPerPage: number };
  // sort(key: string) {
  //   if (key !== '') {
  //     this.key = key;
  //     this.reverse = !this.reverse;
  //   }
  // }
  tabId = 0;
  tabs = [
    { name: 'Report Schedules' },
    { name: 'Flow Schedules' },
    { name: 'Gateway Schedules' }
  ];

  public commonModel: CommonModel;
  constructor(
    private schedulerService: SchedulerService,
    private tenantService: TenantService,
    public utility: UtilityService,
    private toastr: ToastrService,
    private _utility: AppUtilService,
    public coreService: CoreUtilityService,
    private route: ActivatedRoute,
    private router: Router,
    public _toolbar: ToolbarComponent,) {
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
    this.utility.entitySelected = "Reports";
    this.commonModel = this.tenantService.currentTenantValue;
    this.showSpinner = true;
    this.getTenants();
  }

  getTenants() {
    this.tenantService.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      tenant => {
        this.tenants = tenant;
        if (tenant.tenantId === undefined) {
          return;
        }
        this.rptUserModel.tenantId = tenant.tenantId;
        this.route.queryParams.subscribe(p => {
          this.tabId = (this.route.snapshot.queryParams['tabId']) ? this.route.snapshot.queryParams['tabId'] : 0;
          this.tabGroup.selectedIndex = this.tabId;
          if (this.tabId == 0) {
            this.getUserReportsSchedules();
          } else if (this.tabId == 1) {
            this.getFlowSchedules();
          }
          else {
            this.getGatewaySchedules();
          }
        });

      }, err => {
        console.log(err);
      });
  }

  getData(obj) {
    let index = 0
    this.startingIndex = obj.pageIndex * obj.pageSize,
      this.endingIndex = this.startingIndex + obj.pageSize;
  }

  getData1(obj) {
    let index = 0
    this.startingIndex1 = obj.pageIndex * obj.pageSize;
    this.endingIndex1 = this.startingIndex1 + obj.pageSize;
  }

  getData2(obj) {
    let index = 0
    this.startingIndex2 = obj.pageIndex * obj.pageSize;
    this.endingIndex2 = this.startingIndex2 + obj.pageSize;
  }
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.reportScheduleDataSource.filter = filterValue;
  }
  applyFilter1(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.flowScheduleDataSource.filter = filterValue;
  }

  applyFilter2(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.gatewayScheduleDataSource.filter = filterValue;
  }
  getUserReportsSchedules() {
    this.showSpinner = true;
    this.rptUserModel.tenantId = this.tenantService.currentTenantValue.tenantId;
    this.rptUserModel.userId = this.tenantService.currentTenantValue.userId;

    this.schedulerService.getReportsSchedulesList(this.rptUserModel).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      if (resp) {
        if (resp.status) {
          this.showSpinner = false;
          this.reportsScheduleList = [];
          // this.toastr.error(resp.message);
          // this.router.navigate(['/home/apps']);
        } else {
          this.reportScheduleDataSource = new MatTableDataSource(resp);
          this.showSpinner = false;
          this.reportScheduleDataSource.paginator = this.paginator;
          this.reportScheduleDataSource.sort = this.sort;

        }
      }
    });
  }

  getFlowSchedules() {
    this.showSpinner = true;
    this.rptUserModel.tenantId = this.tenantService.currentTenantValue.tenantId;
    this.rptUserModel.userId = this.tenantService.currentTenantValue.userId;

    this.schedulerService.getFlowSchedulesList(this.rptUserModel).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      if (resp) {
        if (resp.status) {
          this.showSpinner = false;
          this.flowScheduleList = [];
          // this.toastr.error(resp.message);
          // this.router.navigate(['/home/apps']);
        } else {
          this.flowScheduleDataSource = new MatTableDataSource(resp)
          this.showSpinner = false;
          this.flowScheduleDataSource.sort = this.sort1;
          this.flowScheduleDataSource.paginator = this.paginator1;
        }
      }
    });
  }

  getGatewaySchedules() {
    this.showSpinner = true;
    this.rptUserModel.tenantId = this.tenantService.currentTenantValue.tenantId;
    this.rptUserModel.userId = this.tenantService.currentTenantValue.userId;

    this.schedulerService.getGatewaySchedulesList(this.rptUserModel).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      if (resp) {
        if (resp.status) {
          this.showSpinner = false;
          this.GatewayScheduleList = [];
          // this.toastr.error(resp.message);
          // this.router.navigate(['/home/apps']);
        } else {
          this.gatewayScheduleDataSource = new MatTableDataSource(resp)
          this.showSpinner = false;
          this.gatewayScheduleDataSource.sort = this.sort1;
          this.gatewayScheduleDataSource.paginator = this.paginator1;
        }
      }
    });

  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { tabId: tabChangeEvent.index } });
    //setTimeout(() => {
    //  switch (tabChangeEvent.index) {
    //    case 0:
    //      //!this.userList.paginator ? this.userList.paginator = this.userPaginator : null;
    //      break;
    //    case 1:
    //      //!this.reportsList.paginator ? this.reportsList.paginator = this.reportPaginator : null;
    //      break;
    //  }
    //});
  }

  modifySchedule(rpt) {
    this.showSpinner = true;
    this.type = "Reportscheduler"
    this.router.navigateByUrl("/home/scheduler/" + this.type + "/" + rpt.appId + "/" + rpt.templateId + "/" + rpt.reportId + "/" + rpt.scheduleId);
  }

  modifyFlowSchedule(rpt) {
    this.showSpinner = true;
    this.router.navigateByUrl("/home/flowScheduler/dataSource/" + rpt.dataSourceId + "/" + rpt.scheduleId);
  }

  modifygatewaySchedule(rpt) {
    this.showSpinner = true;
    this.router.navigateByUrl("/home/flowScheduler/gateway/" + rpt.dataSourceId + "/" + rpt.scheduleId);
  }

  ngAfterViewInit() {
    this.tabGroup.selectedIndex = this.tabId;
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
