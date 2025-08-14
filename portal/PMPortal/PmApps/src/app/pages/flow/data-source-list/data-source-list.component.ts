import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';


import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TenantService, ReportingService } from '../../../PmCore/services';
import { FlowService } from '../../../PmCore/services/FlowService/flow.service';
import { CommonModel } from '../../../PmModel/common.model';
import { Datasource } from '../../../PmModel/datasource';
import { ToastrService } from 'ngx-toastr';
import { DeleteDialog, AppUtilService } from 'src/app/PmCore/shared/app-util.service';
import { AdhocReportutilityService } from 'projects/AppAdhoc/src/app/adhoc-reportutility.service';
import { Location , DatePipe } from '@angular/common';
import { CronSchedule, FlowSchedule } from '../../scheduler/flow/flow-scheduler.component';
import { SchedulerService } from 'src/app/PmCore/services/SchedulerService/scheduler.service';
@Component({
  selector: 'app-data-source-list',
  templateUrl: './data-source-list.component.html',
  styleUrls: ['./data-source-list.component.scss']
})
export class DataSourceListComponent implements OnInit, OnDestroy, AfterViewInit {
  datasourceList: Datasource[];
  tenants: CommonModel;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  commonModel: CommonModel;
  previousTenant: string;
  showSpinner: boolean;
  isTableHasData = true;
  displayedColumns: string[] = ['dataSourceName', 'dataSourceDescription', 'connectorType', 'templateName', 'actions'];
  dataSource: MatTableDataSource<Datasource>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  filter: any;
  flowType = '';
  scheduleObj: FlowSchedule = {
    appId: undefined,
    appName: undefined, 
    tenantId: '',
    reportFormat: '',
    templateId: undefined,
    dataSourceId: 0,
    dataSourceName: '',
    dataSourceDescription: '',
    dataFlowId: undefined,
    dataFlowName: undefined,
    dataFlowDescription: undefined,
    userId: '',
    reportCreatedBy: undefined,
    scheduleId: undefined,
    scheduleStatus: undefined,
    scheduleCreatedBy: undefined,
    scheduleCreatedOn: undefined,
    scheduleModifiedBy: undefined,
    scheduleModifiedOn: undefined,
    scheduleInfo: new CronSchedule
  };
  
  
  constructor(
    private _service: FlowService,
    private _router: Router,
    private _configService: TenantService,
    private _toastr: ToastrService,
    public _utility: AppUtilService,
    public dialog: MatDialog,
    public adhocUtility: AdhocReportutilityService,
    private location: Location,
    private _rptService: ReportingService,
    private schedulerService: SchedulerService,
    private datePipe: DatePipe
    

    
  ) { 
}

  ngOnInit() : void {
    this.dataSource = new MatTableDataSource();
    if(this._router.url.includes('Transformers') == true)
    {
      this._utility.importerdatasource = true;
    }
    else
    {
      this._utility.importerdatasource = false;
    }
    this.commonModel = this._configService.currentTenantValue;
    this.getTenants();
    this._utility.previousPage = this._router.url
  }
  applyFilter(event: string) {
    const filterValue = event;
    if (filterValue != undefined || filterValue != null) {
      this.dataSource.filter = filterValue.trim().toLowerCase();
      this._utility.saveFilter = filterValue;
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
      if (this.dataSource.filteredData.length > 0) {
        this.isTableHasData = true;
        
      } else {
        this.isTableHasData = false;
        this._utility.isTableHasDatasource = false;
      }
    }

  }
  getDataSourcesList(tenantId): void {
    this.showSpinner = true;
    this._utility.showSpinner = true;
    // this.dataSource = new MatTableDataSource();
    this.datasourceList = [];
    this._service.getDataSourcesList(tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      if (resp) {
        this.datasourceList = resp.filter((dataSource) =>
          !(dataSource.connectorType.includes("Alerton") || dataSource.connectorType.includes("Trane")));
        this.dataSource = new MatTableDataSource(this.datasourceList);
        if(this.datasourceList.length > 0)
        {
          this._utility.isTableHasDatasource = true;
        }
        else
        {
          this._utility.isTableHasDatasource = false;
        }
        
        if (this.adhocUtility.adhocPreviousRoute != undefined) {
          if (this.adhocUtility.adhocPreviousRoute.toString().indexOf("data-load-history") > 0 ||
            this.adhocUtility.adhocPreviousRoute.toString().indexOf("data-source-detail") > 0 ||
            this.adhocUtility.adhocPreviousRoute.toString().indexOf("flowScheduler") > 0) {
            this.filter = this._utility.saveFilter;
            this.applyFilter(this.filter);
          }
          else {
            this.filter = '';
            this._utility.saveFilter = '';
          }
        }
        else {
          this.filter = '';
          this._utility.saveFilter = '';
        }
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
      else {
        this.showSpinner = false;
        this._utility.showSpinner = false;
        this.datasourceList = [];
      }
      this.showSpinner = false;
      this._utility.showSpinner = false;
    }, err => {
      this.dataSource = new MatTableDataSource();
      //this._toastr.error("Error occurred to get datasources list");
      this.datasourceList = [];
      this._utility.showSpinner = false;
      this.showSpinner = false;
    });

  }
  schedule(ds) {
    if(this._router.url.includes('Transformers'))
    {
    const schId = ds.scheduleId ? ds.scheduleId : null;
    this._router.navigateByUrl("/home/flowScheduler/Transformers/" + ds.dataSourceId + "/" + schId);
  }
  else
  {
    const schId = ds.scheduleId ? ds.scheduleId : null;
    this._router.navigateByUrl("/home/flowScheduler/dataSource/" + ds.dataSourceId + "/" + schId);
  }
}
  getTenants() {
    this._configService.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      tenant => {
        this.tenants = tenant;
        if (tenant.tenantId === undefined) {
          return;
        } else if (!tenant.hasOwnProperty("tenantId") || !tenant.hasOwnProperty("userId")) {
          return;
        }
        //} else if (this.commonModel.tenantName !== this.previousTenant) {
        //  this.previousTenant = tenant.tenantName;
        //  this.tenants.tenantId = this.commonModel.tenantId;
        this.getDataSourcesList(tenant.tenantId);
        //} else {
        //  this.previousTenant = tenant.tenantName;
        //  this.getDataSourcesList(this.tenants.tenantId);
        //}
      }, err => {
        console.log(err);
      });
  }
  deleteDatasource(ds): void {
    const dialogRef = this.dialog.open(DeleteDialog, {
      width: "390px",
      data: { id: 0, type: '', message: 'Are you sure, you want to delete this datasource <b>' + ds.dataSourceName + '</b>?', action: 'Delete', title: 'Confirmation' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true) {
        this._service.deleteDatasource(ds.dataSourceId, this.tenants.tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          if (res.value == "Success") {
            this._toastr.success("Datasource deleted successfully");
            this.getDataSourcesList(this.tenants.tenantId);
          }
        }, err => {

        });
      }
    });
  }
  Run(ds): void{
    this.scheduleObj.dataSourceDescription = ds.dataSourceDescription
    this.scheduleObj.dataSourceId = ds.dataSourceId
    this.scheduleObj.dataSourceName = ds.dataSourceName
    this.scheduleObj.reportFormat = "PDF"
    this.scheduleObj.tenantId = this.tenants.tenantId
    this.scheduleObj.userId = this.tenants.userId
    this.scheduleObj.scheduleInfo.daysOfWeek = [];
    this.scheduleObj.scheduleInfo.isMailSchedule = true
    this.scheduleObj.scheduleInfo.isRepeat = false
    this.scheduleObj.scheduleInfo.scheduleRecurrence = "time"
    const sdt = this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
    this.scheduleObj.scheduleInfo.startDate = sdt
    this.scheduleObj.scheduleInfo.timeInterval = "0.15"
    this.scheduleObj.scheduleInfo.typeOfDay = "day"
    this.scheduleObj.scheduleInfo.typeOfMonthly = "day"
    this.flowType = "dataSource"
    this.schedulerService.createFlowSchedule(this.scheduleObj, this.flowType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      if (resp.status) {
        this._toastr.error(resp.message);
      }
      else{
        this._toastr.success("Schedule has started to process the Importer");
      }
    });

  }
  navigate1() {
    this._router.navigateByUrl("home/flow");
  }
  CopyTrans() {
    this.showSpinner = true
    const userId = this._configService.currentTenantValue.userId
    const tenantId = this._configService.currentTenantValue.tenantId
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

  Initialisation()
  {
    this.showSpinner = true
    const userId = this._configService.currentTenantValue.userId
    const tenantId = this._configService.currentTenantValue.tenantId
    this._service.CreatePredefinedDataSource(tenantId, userId).subscribe(
      () => { },
      (error) => {
        const { status, error: errorMessage } = error;
        status === 200
          ? (this._rptService.showSuccess(errorMessage.text))
          : status === 500
            ? (this._rptService.showError(errorMessage))
            : (this._rptService.showError("Failed To Initialise DataSources"));
        this.showSpinner = false;
        this.getDataSourcesList(tenantId);
      }
    );
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

