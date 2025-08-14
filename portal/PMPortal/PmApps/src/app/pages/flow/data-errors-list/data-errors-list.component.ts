import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TenantService } from '../../../PmCore/services';
import { FlowService } from '../../../PmCore/services/FlowService/flow.service';
import { CommonModel } from '../../../PmModel/common.model';
import { Datasource } from '../../../PmModel/datasource';
import { ToastrService } from 'ngx-toastr';
import { DataLoadHistory } from '../../../PmModel/dataLoadHistory';
import { Location } from '@angular/common';
import { ExceptionLogHistory } from '../../../PmModel/exceptionLogHistory';

@Component({
  selector: 'app-data-errors-list',
  templateUrl: './data-errors-list.component.html',
  styleUrls: ['./data-errors-list.component.scss']
})
export class DataErrorsListComponent implements OnInit, OnDestroy, AfterViewInit {
  dataLoadHistory: DataLoadHistory[];
  exceptionLogHistory: ExceptionLogHistory[];
  tenants: CommonModel;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  commonModel: CommonModel;
  previousTenant: string;
  showSpinner: boolean;
  dataSourceId: number;
  historyId: number;
  tenantId: string;
  dataSourceName: string;
  isTableHasData = true;
  isTableHasData1 = true;
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[];
  @ViewChild(MatPaginator, { static: true }) tableOnePaginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) tableOneSort: MatSort;

  exceptionLogDataSource: MatTableDataSource<ExceptionLogHistory>;
  displayedColumnsExp: string[] = ['exceptionMsg', 'exceptionType', 'exceptionSource', 'connectorType'];
  @ViewChild('TableTwoPaginator', { static: true }) tableTwoPaginator: MatPaginator;
  @ViewChild('TableTwoSort', { static: true }) tableTwoSort: MatSort;

  constructor(
    private _service: FlowService,
    private _router: Router,
    private _configService: TenantService,
    private _toastr: ToastrService,
    private _route: ActivatedRoute,
    private location: Location,

  ) { }

  ngOnInit() {
    this.dataSource = new MatTableDataSource();
    this.dataSourceId = +this._route.snapshot.paramMap.get('dataSourceId');
    this.historyId = +this._route.snapshot.paramMap.get('historyId');
    this.tenantId = this._route.snapshot.paramMap.get('tenantId');
    this.commonModel = this._configService.currentTenantValue;
    this.getTenants();
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    if (this.dataSource.filteredData.length > 0) {
      this.isTableHasData = true;
    } else {
      this.isTableHasData = false;
    }
  }

  applyLogFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.exceptionLogDataSource.filter = filterValue.trim().toLowerCase();

    if (this.exceptionLogDataSource.paginator) {
      this.exceptionLogDataSource.paginator.firstPage();
    }
    if (this.dataSource.filteredData.length > 0) {
      this.isTableHasData1 = true;
    } else {
      this.isTableHasData1 = false;
    }
  }

  getDataLoadHistory(): void {
    this.showSpinner = true;
    this.dataSource = new MatTableDataSource();
    this.dataLoadHistory = [];
    this._service.getErrorRecordsByDatasourceHistory(this.dataSourceId, this.historyId, this.tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      if (resp) {
        if (resp.table2) {
          if (resp.table2.length > 0) {
            this.dataLoadHistory = resp.table2;
            this.displayedColumns = Object.keys(resp.table2[0]);
            this.dataSource = new MatTableDataSource(this.dataLoadHistory);
            this.dataSource.paginator = this.tableOnePaginator;
            this.dataSource.sort = this.tableOneSort;
          } else {
            this.isTableHasData = false;
          }
        }
        if (resp.table1) {
          if (resp.table1.length > 0) {
            this.dataSourceName = resp.table1[0].dataSourceName;
          }
        }
      }
      this.showSpinner = false;
    }, err => {
      this.dataSource = new MatTableDataSource();
      this._toastr.error("Error occurred to get data");
      this.dataLoadHistory = [];
      this.showSpinner = false;
    });
  }
  capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  getExceptionLogHistory(): void {
    this.exceptionLogDataSource = new MatTableDataSource();
    this._service.getExceptionHistory(this.dataSourceId, this.tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      if (resp) {
        this.exceptionLogHistory = resp;
        if (this.exceptionLogHistory.length > 0) {
          this.dataSourceName = this.exceptionLogHistory[0].dataSourceName;
        }
        this.exceptionLogDataSource = new MatTableDataSource(this.exceptionLogHistory);
        this.exceptionLogDataSource.paginator = this.tableTwoPaginator;
        this.exceptionLogDataSource.sort = this.tableTwoSort;
      }
      this.showSpinner = false;
    }, err => {
      this.exceptionLogDataSource = new MatTableDataSource();
      this._toastr.error("Error occurred to get data");
      this.exceptionLogHistory = [];
      this.showSpinner = false;
    });
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
        this.getDataLoadHistory();
        //this.getExceptionLogHistory();
      }, err => {
        console.log(err);
      });
  }
  goBack(): void {
    this.location.back();
  }
  reloadHistory() {
    this.getDataLoadHistory();
    //this.getExceptionLogHistory();
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.tableOnePaginator;
    this.dataSource.sort = this.tableOneSort;
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
