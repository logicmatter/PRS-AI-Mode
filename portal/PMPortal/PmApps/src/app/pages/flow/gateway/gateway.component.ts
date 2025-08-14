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
import { Location } from '@angular/common';

@Component({
  selector: 'app-gateway',
  templateUrl: './gateway.component.html',
  styleUrls: ['./gateway.component.scss']
})
export class GatewayComponent implements OnInit, OnDestroy, AfterViewInit {

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
  ) { }

  ngOnInit() {
    this.dataSource = new MatTableDataSource();
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
        this.datasourceList = resp.filter((dataSource) => (dataSource.connectorType.includes("Alerton") || dataSource.connectorType.includes("Trane") ));
        this.dataSource = new MatTableDataSource(this.datasourceList);
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
    const schId = ds.scheduleId ? ds.scheduleId : null;
    this._router.navigateByUrl("/home/flowScheduler/gateway/" + ds.dataSourceId + "/" + schId);
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
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
