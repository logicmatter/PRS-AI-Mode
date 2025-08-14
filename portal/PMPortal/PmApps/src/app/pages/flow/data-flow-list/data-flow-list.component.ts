import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TenantService } from '../../../PmCore/services';
import { FlowService } from '../../../PmCore/services/FlowService/flow.service';
import { CommonModel } from '../../../PmModel/common.model';
import { DataFlow } from '../../../PmModel/datasource';
import { ToastrService } from 'ngx-toastr';
import { AppUtilService } from 'src/app/PmCore/shared/app-util.service';
@Component({
  selector: 'app-data-flow-list',
  templateUrl: './data-flow-list.component.html',
  styleUrls: ['./data-flow-list.component.scss']
})
export class DataFlowListComponent implements OnInit, OnDestroy {
  dataFlowList: DataFlow[];
  tenants: CommonModel;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  commonModel: CommonModel;
  previousTenant: string;
  showSpinner: boolean;
  dataFlow: any;
  displayedColumns: string[] = ['dataFlowName', 'dataFlowDescription', 'templateName', 'actions'];
  dataSource: MatTableDataSource<DataFlow>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private _service: FlowService,
    private _router: Router,
    private _configService: TenantService,
    private _toastr: ToastrService,
    public _utility: AppUtilService
  ) { }

  ngOnInit() {
    this.commonModel = this._configService.currentTenantValue;
    this.getTenants();
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  getDataFlowsList(tenantId): void {
    this.showSpinner = true;
    this._utility.showSpinner = true;
    this.dataFlowList = [];
    this.dataSource = new MatTableDataSource();
    this._service.getDataFlowsList(tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      if (resp) {
        this.dataFlowList = resp;
        this.dataSource = new MatTableDataSource(this.dataFlowList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
      this.showSpinner = false;
      this._utility.showSpinner = false;
    }, err => {
      this._toastr.error("Error occurred to get data flow list");
      this.showSpinner = false;
      this._utility.showSpinner = false;
    });
  }
  schedule(ds) {
    const schId = ds.scheduleId ? ds.scheduleId : null;
    this._router.navigateByUrl("/home/flowScheduler/dataFlow/" + ds.dataFlowId + "/" + schId);
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
        //else if (this.commonModel.tenantName !== this.previousTenant) {
        //  this.previousTenant = tenant.tenantName;
        //  this.tenants.tenantId = this.commonModel.tenantId;
        this.getDataFlowsList(tenant.tenantId);
        //} else {
        //  this.previousTenant = tenant.tenantName;
        //  this.getDataFlowsList(this.tenants.tenantId);
        //}
      }, err => {
        console.log(err);
      });
  }
  deleteDataflow(ds): void {
    this._service.deleteDataFlow(ds.dataFlowId, this.tenants.tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.value == "Success") {
        this._toastr.success("Data Flow deleted successfully");
        this.getDataFlowsList(this.tenants.tenantId);
      }
    });
  }
  ngAfterViewInit() {
    //this.dataSource.paginator = this.paginator;
    //this.dataSource.sort = this.sort;
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
