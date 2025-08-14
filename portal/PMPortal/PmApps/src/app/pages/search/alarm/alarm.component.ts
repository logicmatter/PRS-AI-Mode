import { Component, OnInit, ChangeDetectorRef, Input, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SearchUtilityService } from '../search-utility.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilityService } from 'src/app/PmCore/services/utility.service';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
import { AppUtilService, DeleteDialog } from 'src/app/PmCore/shared/app-util.service';
import { AdhocReportutilityService } from 'projects/AppAdhoc/src/app/adhoc-reportutility.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';
import { Location } from '@angular/common';
import { Search } from 'src/app/PmModel/search.model';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonModel } from 'src/app/PmModel/common.model';
import { TenantService, SearchServiceService, ReportingService } from 'src/app/PmCore/services';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ToolbarComponent } from 'src/app/layout';
import { stringify } from 'querystring';
import { Trailicmodel } from '../../../PmModel/trailicmodel.model'
import cloneDeep from 'lodash/cloneDeep';
import clonedeep from 'lodash.clonedeep';

@Component({
  selector: 'app-alarm-search',
  templateUrl: './alarm.component.html',
  styleUrls: ['./alarm.component.scss']
})
export class AlarmComponent implements OnInit {
  // MatPaginator Inputs
  length: number;
  currentPageSize = 10;
  currentPageIndex = 0;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  page = 0;
  size = 10;
  displayedColumns = ['checked', 'objName', 'alarmType', 'descr', 'propDescr', 'devInst'];
  _selectionObjInput: any;
  //alarmList: any;
  startingIndex: number;
  endingIndex: any;
  tenants: CommonModel;
  isDetails: any;
  public model: Search = new Search();
  regex = new RegExp('%20');
  dataSource = new MatTableDataSource();
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;
  saveFilter: string;
  dataLength: number = 0;
  alarmList: any;
  actualPaginator: MatPaginator;
  isDisable: boolean = false;
  public AdditionalData: Trailicmodel = new Trailicmodel();
  dummyreportID: any;


  @ViewChild(MatPaginator, { static: false })
  set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }
  // @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false })
  set sort(value: MatSort) {
    if (this.dataSource) {
      this.dataSource.sort = value;
    }
  }
  index1: any;
  key: string;
  reverse: boolean;
  tempAray: any[];
  tempAray1: any;
  showPlot: boolean;
  filter: any;
  selectedItems = {};
  showSpinner: boolean = false;
  disableTabs: boolean;
  sortDirection;
  sortProperty;
  @Input() set selectionObjInput1(searchModelInput: string) {
    this._selectionObjInput = searchModelInput;
  }
  ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    public route: ActivatedRoute,
    private router: Router,
    private tenantService: TenantService,
    public utility: UtilityService,
    private coreService: CoreUtilityService,
    public _utility: AppUtilService,
    private location: Location,
    private search: SearchServiceService,
    public adhocUtility: AdhocReportutilityService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    public _toolbar: ToolbarComponent,
    private _rptService: ReportingService) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    this.selectItem(this.coreService.maxRecords, 1);
    this.isSelectedItem(this.coreService.maxRecords, 1);
  }
  selectItem(item, id) {
    this.selectedItems[id] = item;
    // console.log(item);
    this.showSpinner = true;
    this.coreService.maxRecords = item;
    this.showSpinner = false;
  }
  isSelectedItem(item, id) {
    return this.selectedItems[id] && this.selectedItems[id] === item;
  }


  ngOnInit() {
    var mastertenantValue = localStorage.getItem('mastertenant');
    if (mastertenantValue == "true") {
      localStorage.setItem('mastertenant', 'false');
      this.tenantService.triggerTenantSelected(this._utility.tenantId);
    }
    console.log(window.location.href);
    if (window.location.href.includes('searchobj') == true) {
      this._toolbar.enablebutton();
    }
    if (this.utility.entitySelected == "All") {
      this.utility.entitySelected = "All"
      if (window.location.href.includes('searchobj') == true) {
        this._toolbar.enablebutton();
      }
    }
    else {
      this.utility.entitySelected = "Alarm"
      if (window.location.href.includes('searchobj') == true) {
        this._toolbar.enablebutton();
      }
    }
    this.tenantService.getLicenseInfo().subscribe(resp => {
      this._utility.licenseInfo.objectLimit = resp.objectLimit
    });
    if (localStorage.getItem('ItemPerPage') !== null) {
      this.currentPageSize = +localStorage.getItem('ItemPerPage');
      this.size = +localStorage.getItem('ItemPerPage');
    }
    else {
      this.currentPageSize = 10;
      this.size = 10;
    }
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.model.keyWord = params.keyword;
      this.model.objectType = params.objectType;
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.app = params.app;
      this.model.DevNum = params.DevNum;
      this.isDetails = params.isDetails == undefined ? 'false' : params.isDetails;

      if (this.adhocUtility.keyWord) {
        this.model.keyWord = this.adhocUtility.keyWord.trim();
      } else {
        this.adhocUtility.keyWord = '';
      }

      this.model = this.model;
      if (this.model.keyWord !== '') {
        this.adhocUtility.keyWord = this.model.keyWord;
      }
      this.route;
      if (this.adhocUtility.adhocPreviousRoute == "/appAdhoc/search") {
        if (this.adhocUtility.keyWord) {
          if (this.adhocUtility.saveFilter) {
            this.model.keyWord = this.adhocUtility.saveFilter.trim();
          }
          else {
            this.model.keyWord = this.adhocUtility.keyWord;
          }
        }
        else {
          this.model.keyWord = this.adhocUtility.saveFilter.trim();
        }
      }
      if (this.utility.pattern.exec(this.model.keyWord) !== null) {
        if (
          this.utility.pattern.exec(this.model.keyWord)[0] === '*' ||
          this.utility.pattern.exec(this.model.keyWord)[0] === '?'
        ) {
          this.utility.patternShow = true;
          if (this.utility.pattern.exec(this.model.keyWord)[0] === '*') {
            this.utility.patternInfo = '\'*\'- Represents zero or more characters';
          }
          if (this.utility.pattern.exec(this.model.keyWord)[0] === '?') {
            this.utility.patternInfo = '\'?\'- Represents a single character';
          }
        } else {
          this.utility.patternShow = false;
        }
      } else {
        this.utility.patternShow = false;
      }
    });
    this.getTenants();
    if (this.router.url.indexOf("searchobj") > 0) {
      if (this.router.url == '/searchobj/alarm?objectType=Alarm&app=search' || this.router.url == '/searchobj/alarm?objectType=Alarm&keyword=' + this.adhocUtility.keyWord + '&app=search') {
        this.utility.routerValue = true;
      }
      else
        if (this.router.url == '/searchobj/alarm?objectType=Alarm&DevNum=' + this.model.DevNum + '&isDetails=true&app=search' &&
          (this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&keyword=' + this.model.keyWord + '&app=search'
          )) {
          this.utility.routerValue = false;
        } else
          if (this.router.url == '/searchobj/alarm?objectType=Alarm&DevNum=' + this.model.DevNum + '&isDetails=true&app=search' &&
            (this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&app=search' ||
              this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&keyword=' + this.model.keyWord + '&app=search'
              || this.adhocUtility.adhocPreviousRoute.indexOf("%20") > 0)) {
            this.utility.routerValue = false;
          }
          else if (this.adhocUtility.adhocPreviousRoute == '/searchobj/alarm/alarmDetail?objectType=Alarm&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search') {
            this.utility.routerValue = false;
            if (this.adhocUtility.adhocPreviousRoute == '/searchobj/alarm/alarmDetail?objectType=Alarm&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' &&
              this.router.url == '/searchobj/alarm?objectType=Alarm&app=search') {
              this.utility.routerValue = true;
            }
          }

          else if (this.router.url != '/searchobj/alarm?objectType=Alarm&app=search' && this.adhocUtility.adhocPreviousRoute == '/appAdhoc/search') {
            this.utility.routerValue = true;
            if (this.router.url == '/searchobj/alarm?objectType=Alarm&DevNum=' + this.adhocUtility.paramDevNum + '&isDetails=true&app=search' &&
              this.adhocUtility.adhocPreviousRoute == '/appAdhoc/search') {
              this.utility.routerValue = false;
            }
          }
          else if (this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&keyword=' + this.adhocUtility.keyWord + '&app=search') {
            this.utility.routerValue = false;
            if (this.regex.exec(this.adhocUtility.adhocPreviousRoute) !== null) {
              if (this.regex.exec(this.adhocUtility.adhocPreviousRoute)[0] === "%20") {
                this.utility.routerValue = false;
              }
            }
          }

    }
    else {
      if (this.router.url == '/search/alarm?objectType=Alarm&app=search' ||
        this.router.url == '/search/alarm?objectType=Alarm&keyword=' + this.adhocUtility.keyWord +
        '&app=search' || this.router.url == '/search/alarm?objectType=Alarm&keyword='
        + this.adhocUtility.keyWord + '&app=adhoc' ||
        this.router.url == '/search/alarm?objectType=Alarm&app=adhoc') {
        this.utility.routerValue = true;
      }
      else
        if (this.router.url == '/search/alarm?objectType=Alarm&DevNum=' + this.model.DevNum + '&isDetails=true&app=search' &&
          (this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&keyword=' + this.model.keyWord + '&app=search'
          )) {
          this.utility.routerValue = false;
        } else
          if (this.router.url == '/search/alarm?objectType=Alarm&DevNum=' + this.model.DevNum + '&isDetails=true&app=search' &&
            (this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&app=search' ||
              this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&keyword=' + this.model.keyWord + '&app=search'
              || this.adhocUtility.adhocPreviousRoute.indexOf("%20") > 0)) {
            this.utility.routerValue = false;
          }
          else if ((this.router.url == '/search/alarm?objectType=Alarm&DevNum=' + this.model.DevNum + '&isDetails=true&app=search' &&
            this.adhocUtility.adhocPreviousRoute == '/appAdhoc/search')) {
            this.utility.routerValue = false;
          }
          else if (this.adhocUtility.adhocPreviousRoute == "/search/alarm/deviceDetail?objectType=Device&DevNum=" + this.model.DevNum + '&isDetails=true&app=search') {
            this.utility.routerValue = false;
          }
          else if (this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&keyword=' + this.model.keyWord + 'app=search') {
            this.utility.routerValue = false;
          }
          else if (this.router.url != '/search/alarm?objectType=Alarm&app=search' && this.adhocUtility.adhocPreviousRoute == '/appAdhoc/search') {
            this.utility.routerValue = true;
          }
          else if (this.adhocUtility.adhocPreviousRoute == '/search/alarm/alarmDetail?objectType=Alarm&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search') {
            this.utility.routerValue = false;
            if (this.adhocUtility.adhocPreviousRoute == '/search/alarm/alarmDetail?objectType=Alarm&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' &&
              this.router.url == '/search/alarm?objectType=Alarm&app=search') {
              this.utility.routerValue = true;
            }
            if (this.regex.exec(this.router.url) !== null) {
              if (this.regex.exec(this.router.url)[0] === "%20") {
                this.utility.routerValue = true;
              }
            }
          }
          else if (this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&keyword=' + this.adhocUtility.keyWord == undefined ? '' : this.adhocUtility.keyWord + '&app=search' &&
            this.router.url == '/search/alarm?objectType=Alarm&DevNum=' + this.model.DevNum + '&isDetails=true&app=search') {
            this.utility.routerValue = false;
          } else if (this.regex.exec(this.router.url) !== null) {
            if (this.regex.exec(this.router.url)[0] === "%20") {
              this.utility.routerValue = true;
            }
          }
          else {
            this.utility.routerValue = true;
          }
      if (this.router.url == "/search/alarm?objectType=Alarm&app=adhoc") {
        this.utility.routerValue = true;
      }
    }
  }


  getTenants() {
    this.tenantService.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      tenant => {
        this.tenants = tenant;
        if (tenant.tenantId === undefined) {
          return;
        }
        this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
        this.model.userId = this.tenantService.currentTenantValue.userId;
        this.model.pageNumber = 1;
        if (this.tenantService.currentTenantValue.tenantName != this.coreService.previousTenant) {
          this.coreService.previousTenant = this.tenantService.currentTenantValue.tenantName;
          this.model.tenantId = tenant.tenantId;
          //this.filter = '';
          if (this.adhocUtility.saveFilter) {
            if (this.adhocUtility.keyWord) {
              this.model.keyWord = this.adhocUtility.keyWord;
            }
            else {
              this.model.keyWord = '';
            }
          }
          this.adhocUtility.saveFilter = '';
          this.adhocUtility.checkedList = [];
          this.adhocUtility.checkNames = [];
          this._utility.selectedItems = [];

          if (this.router.url == "/appAdhoc/search") {
            this.router.navigate(['./search'], { queryParams: { objectType: 'Alarm', keyword: this.model.keyWord, app: 'adhoc' } });
          }
        }
        if (this.model.objectType != undefined) {
          this.getSearchResults(this.model);
        }
        else {
          this.model = this._selectionObjInput;
          if (this.adhocUtility.checkedList) {
            this._utility.selectedItems = [];
            this.adhocUtility.checkedList.forEach(element => {
              if (typeof element == "string") {
                this._utility.selectedItems.push(element);
              }
              else {
                this._utility.selectedItems.push(element.sid);
              }
            });
            this._selectionObjInput.sidParams = this._utility.selectedItems.toString();
          }

          this.getSearchResults(this._selectionObjInput);
        }

      }, err => {
        console.log(err);
      });
  }

  backParent() {
    this.location.back();
  }
  // Fetch Alarm List from API
  getSearchResults(searchObjects): void {
    this.showSpinner = true;
    //this.dataSource.filter = value.trim().toLowerCase();
    this.length = 0;
    this.search
      .getAlarmList(searchObjects)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(alarmList => {
        this.dataSource = new MatTableDataSource(alarmList.table);
        this.alarmList = alarmList.table;
        this.length = this.dataSource.data.length;
        if (this.model.DevNum == null || this.model.DevNum == '') {
          this.dataLength = alarmList.table1[0].totalCount;
          setTimeout(() => { this.dataSource.paginator.length = this.dataLength; });
        }
        else {
          this.dataLength = this.dataSource.data.length;
        }
        this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size, length: this.length });
        this.dataSource.data.forEach(s => (s["checked"] = false));
        //this.dataSource.data.length = this.dataLength;

        // setTimeout(() => {
        // this.dataSource.data = data;
        // this.cdr.detectChanges();
        // this.dataSource.data.forEach(s => (s["checked"] = false));
        // this.length = this.dataSource.data.length;
        // this.getData({ pageIndex: this.page, pageSize: this.size });
        // this.dataSource.paginator = this.paginator;
        // this.dataSource.sort = this.sort;
        // this.cdr.detectChanges();
        // });

        if (
          (this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
          (this.adhocUtility.adhocPreviousRoute ==
            '/search/alarm/alarmDetail?objectType=' +
            searchObjects.objectType +
            '&sid=' +
            this.adhocUtility.paramSid +
            '&isDetails=true&app=search' || this.adhocUtility.adhocPreviousRoute ==
            '/search/trendlog/trendlog?objectType=' +
            searchObjects.objectType +
            '&sid=' +
            this.adhocUtility.paramSid +
            '&isDetails=true&app=search' ||
            this.adhocUtility.adhocPreviousRoute ==
            '/home/searchList/searchdetails?objectType=Device&DevNum=' +
            this.adhocUtility.paramDevNum +
            '&isDetails=true' || this.adhocUtility.adhocPreviousRoute ==
            '/home/search/alarm/deviceDetail?objectType=Device&DevNum=' +
            this.adhocUtility.paramDevNum +
            '&isDetails=true&app=' + this.model.app ||
            (this.router.url == "/searchobj/alarm?objectType=Alarm&app=search" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == "/search/alarm?objectType=Alarm&app=search" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == "/searchobj/alarm?objectType=Alarm&app=adhoc" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == "/search/alarm?objectType=Alarm&app=adhoc" && this.utility.adhocPreviousRoute == '/appAdhoc/search') || (this._utility.selectedItems != null && this.model.app == 'app')
          )
        ) {
          if (this.model.app == 'app') {
            // this.filter = '';
            // this.adhocUtility.saveFilter = '';
            if (this._utility.selectedItems.length > 0) {
              var temp = new Array();
              this._utility.selectedItems.forEach(s => {
                if (typeof s == "string" || typeof s == "number") {
                  this.dataSource.data.forEach(l => {
                    if (s == l["sid"]) {
                      temp.push({ "sid": Number(s), "objName": l["objName"], "devInst": l["devInst"], "objInst": l["objInst"], "descr": l["descr"], "alarmType": l["alarmType"], "propDescr": l["propDescr"], "checked": true });
                    }
                  });
                }
                else {
                  this.dataSource.data.forEach(l => {
                    if (s.sid == l["sid"]) {
                      temp.push({ "sid": l["sid"], "objName": l["objName"], "devInst": l["devInst"], "objInst": l["objInst"], "descr": l["descr"], "propDescr": l["propDescr"], "alarmType": l["alarmType"], "checked": true });
                    }
                  });
                }

              });

              this.adhocUtility.checkedList = temp;
            }
            this.adhocUtility.saveFilter = this.model.keyWord;
          }

          this.filter = this.adhocUtility.saveFilter;
          if (this.adhocUtility.checkedList.length > 0) {
            this.adhocUtility.checkedList.forEach(s => {
              this.dataSource.data.forEach(l => {
                if (s.sid == l["sid"]) {
                  l["checked"] = true;
                  return;
                }
              });
            });
          }
          if (this._utility.selectedItems) {
            if (this._utility.selectedItems.length > 0 || this.adhocUtility.checkedList.length > 0) {
              this.checked();
              //this.sort.sort(({ id: 'checked', start: 'desc' }) as MatSortable);
            }
          }
        } else {
          this.filter = '';
          this.showPlot = false;
          this.adhocUtility.checkedList = [];
          this.adhocUtility.checkNames = [];

        }
        this.showSpinner = false;
        this.disableTabs = true;
      });
    this._utility.openNav();
  }

  getSearchResultsbyFilter(searchObjects): void {
    this.showSpinner = true;
    //this.dataSource.filter = value.trim().toLowerCase();
    this.length = 0;
    this.search
      .getAlarmList(searchObjects)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(alarmList => {
        this.alarmList = alarmList.table;
        this.dataSource = new MatTableDataSource(alarmList.table);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        if (this.model.DevNum == null || this.model.DevNum == '') {
          this.dataLength = alarmList.table1[0].totalCount;
          setTimeout(() => { this.dataSource.paginator.length = this.dataLength; });
        }
        this.length = this.dataSource.data.length;
        this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size, length: this.length });
        this.dataSource.data.forEach(s => (s["checked"] = false));
        // setTimeout(() => {
        // this.dataSource.data = data;
        // this.cdr.detectChanges();
        // this.dataSource.data.forEach(s => (s["checked"] = false));
        // this.length = this.dataSource.data.length;
        // this.getData({ pageIndex: this.page, pageSize: this.size });
        // this.dataSource.paginator = this.paginator;
        // this.dataSource.sort = this.sort;
        // this.cdr.detectChanges();
        // });

        if (
          (this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
          (this.adhocUtility.adhocPreviousRoute ==
            '/search/alarm/alarmDetail?objectType=' +
            searchObjects.objectType +
            '&sid=' +
            this.adhocUtility.paramSid +
            '&isDetails=true&app=search' || this.adhocUtility.adhocPreviousRoute ==
            '/search/trendlog/trendlog?objectType=' +
            searchObjects.objectType +
            '&sid=' +
            this.adhocUtility.paramSid +
            '&isDetails=true&app=search' ||
            this.adhocUtility.adhocPreviousRoute ==
            '/home/searchList/searchdetails?objectType=Device&DevNum=' +
            this.adhocUtility.paramDevNum +
            '&isDetails=true' || this.adhocUtility.adhocPreviousRoute ==
            '/home/search/alarm/deviceDetail?objectType=Device&DevNum=' +
            this.adhocUtility.paramDevNum +
            '&isDetails=true&app=' + this.model.app ||
            (this.router.url == "/searchobj/alarm?objectType=Alarm&app=search" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == "/search/alarm?objectType=Alarm&app=search" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == "/searchobj/alarm?objectType=Alarm&app=adhoc" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == "/search/alarm?objectType=Alarm&app=adhoc" && this.utility.adhocPreviousRoute == '/appAdhoc/search') || (this._utility.selectedItems != null && this.model.app == 'app') ||
            this.router.url == "/searchobj/alarm?objectType=Alarm&app=adhoc" ||
            this.router.url == '/searchobj/alarm?objectType=Alarm&keyword=' + this.adhocUtility.keyWord + '&app=adhoc' ||
            this.router.url == "/search/alarm?objectType=Alarm&app=search" ||
            this.router.url == '/searchobj/alarm?objectType=Alarm&keyword=' + this.adhocUtility.keyWord + '&app=search' ||
            this.router.url == "/searchobj/alarm?objectType=Alarm&app=search" ||
            this.router.url == "/search/alarm?objectType=Alarm&app=adhoc" ||
            this.router.url == '/search/alarm?objectType=Alarm&keyword=' + this.adhocUtility.keyWord + '&app=search' ||
            this.router.url == '/search/alarm?objectType=Alarm&keyword=' + this.adhocUtility.keyWord + '&app=adhoc'
          )
        ) {
          if (this.model.app == 'app') {
            // this.filter = '';
            // this.adhocUtility.saveFilter = '';
            if (this._utility.selectedItems.length > 0) {
              var temp = new Array();
              this._utility.selectedItems.forEach(s => {
                if (typeof s == "string" || typeof s == "number") {
                  this.dataSource.data.forEach(l => {
                    if (s == l["sid"]) {
                      temp.push({ "sid": Number(s), "objName": l["objName"], "devInst": l["devInst"], "objInst": l["objInst"], "descr": l["descr"], "alarmType": l["alarmType"], "propDescr": l["propDescr"], "checked": true });
                    }
                  });
                }
                else {
                  this.dataSource.data.forEach(l => {
                    if (s.sid == l["sid"]) {
                      temp.push({ "sid": l["sid"], "objName": l["objName"], "devInst": l["devInst"], "objInst": l["objInst"], "descr": l["descr"], "propDescr": l["propDescr"], "alarmType": l["alarmType"], "checked": true });
                    }
                  });
                }

              });

              this.adhocUtility.checkedList = temp;
            }
          }
          this.filter = this.adhocUtility.saveFilter;
          if (this.adhocUtility.checkedList.length > 0) {
            this.adhocUtility.checkedList.forEach(s => {
              this.dataSource.data.forEach(l => {
                if (s.sid == l["sid"]) {
                  l["checked"] = true;
                  return;
                }
              });
            });
          }
          if (this._utility.selectedItems) {
            if (this._utility.selectedItems.length > 0 || this.adhocUtility.checkedList.length > 0) {
              this.checked();
              //this.sort.sort(({ id: 'checked', start: 'desc' }) as MatSortable);
            }
          }
        } else {

          this.showPlot = false;
          this.adhocUtility.checkedList = [];
          this.adhocUtility.checkNames = [];

        }
        this.showSpinner = false;
        this.disableTabs = true;
      });
    this._utility.openNav();
  }
  applyFilter(filterValue: string, event) {
    this.model.filter = true;
    if (event.keyCode === 20 || event.keyCode === 9) {
      return;
    }
    //filterValue = filterValue.trim(); // Remove whitespace
    if (this.adhocUtility.checkedList) {
      this._utility.selectedItems = [];
      this.adhocUtility.checkedList.forEach(element => {
        if (typeof element == "string") {
          this._utility.selectedItems.push(element);
        }
        else {
          this._utility.selectedItems.push(element.sid);
        }
      });
      this.model.sidParams = this._utility.selectedItems.toString();
    }
    if (this.model.app == 'app') {
      this._utility.isUpdate = true;
      this._utility.isObjectSelection = true;
      this._utility.hasPreview = false;
      this._utility.isRunFeatures = false;
      //console.log("----id---", id);
      this._utility.isReportRun = false;
      this._utility.toggle = false;
      // this._utility.isClickedToggle = true;
      this._utility.mainWidthToggle = true;
      this._utility.isReportList = false;
      this._utility.reportData = undefined;
      this._utility.isCreateReport = true;
      this._utility.newReport = false;
    } else {
      this._utility.selectedItems = [];
    }
    let temp = filterValue;
    temp = temp.trim();
    // temp = temp.toLowerCase(); // MatTabledataSource defaults to lowercase matches
    this.dataSource.filter = temp;
    //this.filter = temp;
    this.adhocUtility.saveFilter = '';
    this.model.objectType = 'Alarm';
    this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
    this.model.userId = this.tenantService.currentTenantValue.userId;
    this.model.appId = this._utility.appID
    this.model.keyWord = temp == '' ? null : temp;
    this.model.pageNumber = 1;
    this.getSearchResultsbyFilter(this.model);

  }

  filterByKey(filterValue: string, event) {
    this.model.filter = true;
    if (event.keyCode === 20 || event.keyCode === 9) {
      return;
    }
    if (this.adhocUtility.checkedList) {
      this._utility.selectedItems = [];
      this.adhocUtility.checkedList.forEach(element => {
        if (typeof element == "string") {
          this._utility.selectedItems.push(element);
        }
        else {
          this._utility.selectedItems.push(element.sid);
        }
      });
      this.model.sidParams = this._utility.selectedItems.toString();
    }
    if (this.model.app == 'app') {
      this._utility.isUpdate = true;
      this._utility.isObjectSelection = true;
      this._utility.hasPreview = false;
      this._utility.isRunFeatures = false;
      //console.log("----id---", id);
      this._utility.isReportRun = false;
      this._utility.toggle = false;
      // this._utility.isClickedToggle = true;
      this._utility.mainWidthToggle = true;
      this._utility.isReportList = false;
      this._utility.reportData = undefined;
      this._utility.isCreateReport = true;
      this._utility.newReport = false;
    } else {
      this._utility.selectedItems = [];
    }
    let temp = filterValue;
    temp = temp.trim();
    temp = temp.toLowerCase(); // MatTabledataSource defaults to lowercase matches
    this.dataSource.filter = temp;

    //this.filter = temp;

    this.adhocUtility.saveFilter = temp;
    if ((this.dataSource.filteredData.length > 0 || this.dataSource.filteredData.length == 0) && temp == '' && event.keyCode === 8) {
      this.model.objectType = 'Alarm';
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.appId = this._utility.appID
      this.model.pageNumber = 1;
      if (this.adhocUtility.keyWord) {
        this.model.keyWord = this.adhocUtility.keyWord;
        temp = this.model.keyWord;

      }
      if (this.model.app == 'app') {
        this.model.keyWord = this.adhocUtility.saveFilter;
        temp = this.model.keyWord;

      }
      this.model.keyWord = temp == '' ? null : temp;
      this.getSearchResultsbyFilter(this.model);
    }
  }
  applyFilter1(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
  getData(pageEvent: PageEvent) {
    if (localStorage.getItem('ItemPerPage') !== null) {
      if (parseInt(localStorage.getItem('ItemPerPage')) == pageEvent.pageSize) {
        this.currentPageSize = +localStorage.getItem('ItemPerPage');
      }
      else {
        localStorage.setItem('ItemPerPage', pageEvent.pageSize.toString());
        this.currentPageSize = pageEvent.pageSize;
      }
    }
    else {
      localStorage.setItem('ItemPerPage', pageEvent.pageSize.toString());
      this.currentPageSize = pageEvent.pageSize;
    }
    this.isDisable = true;
    let index = 0;
    this.currentPageIndex = pageEvent.pageIndex;
    this.currentPageSize = pageEvent.pageSize;
    this.startingIndex = pageEvent.pageIndex * pageEvent.pageSize,
      this.endingIndex = this.startingIndex + (pageEvent.pageSize < (pageEvent.length - this.startingIndex) ? pageEvent.pageSize : (pageEvent.length - this.startingIndex));
    this.isDisable = false;
    if (this.model.DevNum == null) {
      pageEvent.previousPageIndex = pageEvent.pageIndex;
      setTimeout(() => { this.dataSource.paginator.length = this.dataLength; });
      if ((this.endingIndex + this.currentPageSize) > this.length && this.length != this.dataLength) {
        this.isDisable = true;

        this.model.pageNumber = Math.round(this.dataLength / this.length);
        if (this.adhocUtility.checkedList) {
          this._utility.selectedItems = [];
          this.adhocUtility.checkedList.forEach(element => {
            if (typeof element == "string") {
              this._utility.selectedItems.push(element);
            }
            else {
              this._utility.selectedItems.push(element.sid);
            }
          });
          this.model.sidParams = this._utility.selectedItems.toString();
        }
        // this.model.rowsPerPage = pageEvent.pageSize < (pageEvent.length - this.startingIndex)? pageEvent.pageSize : (pageEvent.length - this.startingIndex);
        this.search
          .getAlarmList(this.model)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(alarmList => {
            this.dataSource = new MatTableDataSource(alarmList.table);
            this.dataSource.data = alarmList.table.concat(this.alarmList)
            this.alarmList = this.dataSource.data;
            setTimeout(() => {
              this.dataSource.paginator.pageIndex = pageEvent.pageIndex;
              this.dataSource.paginator.length = this.dataLength;
              // this.pageSize = pageEvent.pageSize < (pageEvent.length - this.startingIndex)? pageEvent.pageSize : (pageEvent.length - this.startingIndex)
            });
            this.dataSource.data.forEach(s => (s["checked"] = false));


            if (this.model.app == 'app') {
              // this.filter = '';
              // this.adhocUtility.saveFilter = '';
              if (this._utility.selectedItems.length > 0) {
                var temp = new Array();
                this._utility.selectedItems.forEach(s => {
                  if (typeof s == "string" || typeof s == "number") {
                    this.dataSource.data.forEach(l => {
                      if (s == l["sid"]) {
                        temp.push({ "sid": Number(s), "objName": l["objName"], "devInst": l["devInst"], "objInst": l["objInst"], "descr": l["descr"], "alarmType": l["alarmType"], "propDescr": l["propDescr"], "checked": true });
                      }
                    });
                  }
                  else {
                    this.dataSource.data.forEach(l => {
                      if (s.sid == l["sid"]) {
                        temp.push({ "sid": l["sid"], "objName": l["objName"], "devInst": l["devInst"], "objInst": l["objInst"], "descr": l["descr"], "propDescr": l["propDescr"], "alarmType": l["alarmType"], "checked": true });
                      }
                    });
                  }

                });

                //this.adhocUtility.checkedList = temp;
              }
            }
            // this.filter = this.adhocUtility.saveFilter;
            if (this.adhocUtility.checkedList.length > 0) {
              this.adhocUtility.checkedList.forEach(s => {
                this.dataSource.data.forEach(l => {
                  if (s.sid == l["sid"]) {
                    l["checked"] = true;
                    return;
                  }
                });
              });
            }
            if (this._utility.selectedItems) {
              if (this._utility.selectedItems.length > 0 || this.adhocUtility.checkedList.length > 0) {
                this.checked();
                //this.sort.sort(({ id: 'checked', start: 'desc' }) as MatSortable);
              }
            }

            this.showSpinner = false;
            this.disableTabs = true;
            this.isDisable = false;
          });
        // setTimeout(() => { this.dataSource.paginator.length = this.dataLength; });
      }
      else {
        return;
      }
    }
  }

  setPage(event) {
    this.page = event.pageIndex;
    //this.getSearchResults();
  }
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator; // For pagination
    this.dataSource.sort = this.sort; // For sort
  }
  checked() {
    this.key = '';
    this.reverse = false;
    this.tempAray = [];
    this.tempAray = this.dataSource.data;
    if (this.adhocUtility.checkedList.length > 0) {
      this.adhocUtility.checkedList.forEach(s => {
        this.tempAray.forEach((l, i) => {
          if (s.sid == l.sid) {
            this.dataSource.data.splice(i, 1);
            return;
          }
        });
      });
    }
    const tempArray1 = [...this.adhocUtility.checkedList, ...this.dataSource.data];
    this.dataSource.data = tempArray1.map((item: any) => ({ ...item }));
    this.sortProperty = 'checked';
    this.sortDirection = 'desc';
    if (this.dataSource.sort) {
      this.dataSource.sort.active = this.dataSource.sort.active != "checked" ? "checked" : "checked";

      this.dataSource.sort.direction = "desc";
    }

    //this.paginator.pageIndex = this.page, // number of the page you want to jump.
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
      setTimeout(() => { this.dataSource.paginator.length = this.dataLength; });

    }
  }
  findIndexToUpdate(obj) {
    return obj.sid === this;
  }


  findIndexToUpdate1(obj) {
    return obj.logDescription + obj.trendlogName === this;
  }
  findIndexToUpdate2(obj) {
    return obj.descr + obj.objName === this;
  }
  // Method to Clear Checkbox
  checkedState(obj, evt) {

    // if (this._utility.licenseInfo.isLimitedEdition) {
    //   if(this._utility.reportID == "")
    //   {
    //     this.dummyreportID = -1;
    //   }
    //   else
    //   {
    //     this.dummyreportID = this._utility.reportID;
    //   }
    //   this._rptService.getReportObjectExistsByRooms(this.dummyreportID, obj.sid, this._utility.tenantID, this._utility.appID, obj.checked)
    //   .subscribe(response => {
    //     if (response) {
    // const updateItem = this.adhocUtility.checkedList.find(this.findIndexToUpdate, obj.sid);
    // if (this.model.objectType == 'Trendlog') {
    //   const updateObjName = this.adhocUtility.checkNames.find(this.findIndexToUpdate1, obj.logDescription + obj.trendlogName);
    //   this.index1 = this.adhocUtility.checkNames.indexOf(updateObjName);
    // } else {
    //   const updateObjName = this.adhocUtility.checkNames.find(this.findIndexToUpdate2, obj.descr + obj.objName);
    //   this.index1 = this.adhocUtility.checkNames.indexOf(updateObjName);
    // }

    // let index = this.adhocUtility.checkedList.indexOf(updateItem);

    // // console.log(index);

    // if (index > -1) {
    //   this.adhocUtility.checkedList.splice(index, 1);
    // } else {
    //   this.adhocUtility.checkedList.push(obj);
    // }
    // if (this.index1 > -1) {
    //   this.adhocUtility.checkNames.splice(this.index1, 1);
    // } else {
    //   this.adhocUtility.checkNames.push(obj);
    // }
    // this._utility.selectedItems = this.adhocUtility.checkedList;
    // if (this._utility.selectedItems.length < 0) {
    //   this._utility.hasSelectedBacknetObject = false;
    // }
    // else {
    //   this._utility.hasSelectedBacknetObject = true;
    // }
    //     }
    //     else
    //     {
    //       obj.checked = false;
    //       const dialogRef = this.dialog.open(DeleteDialog, {
    //         width: "390px",
    //         data: {
    //           id: 0,
    //           type: '',
    //           message: 'Reached the Object limit in this Edition.<br/>  Please contact LogicMatter at <b>support@logicmatter.com</b>',
    //           action: "Warning",
    //           title: "Info"
    //         }
    //       });
    //       return;

    //     }
    //   }, error => {
    //     console.error('Error:', error);
    //   });
    // }
    // else
    // {
      const updateItem = this.adhocUtility.checkedList.find(this.findIndexToUpdate, obj.sid);
    if (this.model.objectType == 'Trendlog') {
      const updateObjName = this.adhocUtility.checkNames.find(this.findIndexToUpdate1, obj.logDescription + obj.trendlogName);
      this.index1 = this.adhocUtility.checkNames.indexOf(updateObjName);
    } else {
      const updateObjName = this.adhocUtility.checkNames.find(this.findIndexToUpdate2, obj.descr + obj.objName);
      this.index1 = this.adhocUtility.checkNames.indexOf(updateObjName);
    }

    let index = this.adhocUtility.checkedList.indexOf(updateItem);

    // console.log(index);

    if (index > -1) {
      this.adhocUtility.checkedList.splice(index, 1);
    } else {
      this.adhocUtility.checkedList.push(obj);
    }
    if (this.index1 > -1) {
      this.adhocUtility.checkNames.splice(this.index1, 1);
    } else {
      this.adhocUtility.checkNames.push(obj);
    }
    this._utility.selectedItems = this.adhocUtility.checkedList;
    if (this._utility.selectedItems.length < 0) {
      this._utility.hasSelectedBacknetObject = false;
    }
    else {
      this._utility.hasSelectedBacknetObject = true;
    }
    // }

  }
  clearSelection() {
    this.dataSource.data.filter(g => {
      g["checked"] = false;
      return true;
    });
    this.showPlot = false;
    this.adhocUtility.checkedList = [];
    this.adhocUtility.checkNames = [];
  }

  // onListDrop(event: CdkDragDrop<any[]>) {
  //   moveItemInArray(this.dataSource.data, event.previousIndex, event.currentIndex);
  //   this.dataSource.data = cloneDeep(this.dataSource.data); // Trigger change detection
  // }

  onListDrop(event: CdkDragDrop<string[]>) {
    this.dataSource.sort.active = this.dataSource.sort.active == "checked" ? "" : "";
    this._utility.selectedItems = [];
    this.dataSource.data.forEach((element, i) => {
      console.log(`Moving item from ${event.previousIndex} to index ${event.currentIndex}`);
      if (element["checked"] == true) {

        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        console.log(`event.container ${event.container.data}`)
        this.dataSource.data = clonedeep(this.dataSource.data);
      }
    });
    if (this.adhocUtility.checkedList.length > 0) {
      this.dataSource.data.forEach(l => {
        if (l["checked"] == true) {
          this._utility.selectedItems.push({ "alarmType": l["alarmType"], "descr": l["descr"], "devInst": l["devInst"], "objInst": l["objInst"], "objName": l["objName"],  ["propDescr"]:l["propDescr"],"propObjInst": l["propObjInst"], "sid" : l["sid"],"checked": l["checked"] });
          console.log(this._utility.selectedItems);
        }
      });
    }
    this.adhocUtility.checkedList = this._utility.selectedItems;
  }


  swapPositions = (array, a, b) => {
    [array[a], array[b]] = [array[b], array[a]]
  }

  public getSelected() {
    // if (this._utility.licenseInfo.isLimitedEdition) {
    //   const dialogRef = this.dialog.open(DeleteDialog, {
    //     width: "390px",
    //     data: {
    //       id: 0,
    //       type: '',
    //       message: 'This feature is not available in this Edition.<br/>  Please contact LogicMatter at <b>support@logicmatter.com</b>',
    //       action: "Warning",
    //       title: "Info"
    //     }
    //   });
    //   return;
    // }
    // this.utility.entitySelected = this.model.objectType;
    this.adhocUtility.saveFilter = this.filter;
    this.coreService.sids = this.adhocUtility.checkedList.map(search => {
      return search.sid;
    });
    if (this.model.objectType == 'Trendlog') {
      this.coreService.checkNames = this.adhocUtility.checkNames.map(search => {
        return { key: search.sid, value: search.logDescription + " (" + search.trendlogName + ")" };
      });
    } else {
      this.coreService.checkNames = this.adhocUtility.checkNames.map(search => {
        return { key: search.sid, value: search.descr + " (" + search.objName + ")" };
      });
    }
    if (this.coreService.sids.length > 10 && this.coreService.checkNames.length > 10) {
      const dialogRef = this.dialog.open(DeleteDialog, {
        width: '400px',
        data: { id: 0, type: '', message: 'You have selected more than 10 <b>' + this.model.objectType + '</b>, First 10 selected <b>' + this.model.objectType + '</b> will be used for the report  ?', action: 'Confirm' }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result == true) {
          this.coreService.sids.length = 10;
          this.coreService.checkNames.length = 10
          this.coreService.adhocDurationDesc = '';
          this.coreService.reportParams.objectType = this.model.objectType;
          this.coreService.reportParams.sidArray = this.coreService.sids;
          this.coreService.reportParams.keyWord = this.model.keyWord;
          this.coreService.reportParams.objectName = this.coreService.checkNames;
          console.log(this.coreService.reportParams.sidArray);
          console.log(this.coreService.reportParams.objectName);
          this._utility.previousTenant = undefined;
          this.router.navigate(['/appAdhoc/search']);
          console.log(this.model);
        }
      });
    } else {
      this.coreService.adhocDurationDesc = '';
      this.coreService.reportParams.objectType = this.model.objectType;
      this.coreService.reportParams.sidArray = this.coreService.sids;
      this.coreService.reportParams.keyWord = this.model.keyWord;
      this.coreService.reportParams.objectName = this.coreService.checkNames;
      console.log(this.coreService.reportParams.sidArray);
      console.log(this.coreService.reportParams.objectName);
      this._utility.previousTenant = undefined;
      this.router.navigate(['/appAdhoc/search']);
    }
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
