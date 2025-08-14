import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Search } from 'src/app/PmModel/search.model';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchUtilityService } from '../search-utility.service';
import { UtilityService } from 'src/app/PmCore/services/utility.service';
import { Subject } from 'rxjs';
import { CommonModel } from 'src/app/PmModel/common.model';
import { TenantService, SearchServiceService } from 'src/app/PmCore/services';
import { takeUntil } from 'rxjs/operators';
import { AdhocReportutilityService } from 'projects/AppAdhoc/src/app/adhoc-reportutility.service';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';


@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss']
})
export class DeviceComponent implements OnInit {
  // MatPaginator Inputs
  length: number;
  pageSize = 10;
  currentPageIndex = 0;
  currentPageSize = 10;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  page = 0;
  size = 10;
  displayedColumns = ['devInst', 'objName', 'devDescription', 'devModel', 'trendlogs', 'alarms', 'energyLogs', 'points'];
  _selectionObjInput: any;
  alarmList: any;
  startingIndex: number;
  endingIndex: any;
  tenants: CommonModel;
  isDetails: any;
  public model: Search = new Search();
  regex = new RegExp('%20');
  deviceList = new MatTableDataSource();
  dataLength: any;
  deviceData: any;
  isDisable: boolean = false;
  // @ViewChild(MatPaginator, { static: false }) deivcePaginator: MatPaginator;
  // @ViewChild(MatSort, { static: false }) deivceSort: MatSort;
  @ViewChild(MatPaginator, { static: false })
  set deivcePaginator(value: MatPaginator) {
    if (this.deviceList) {
      this.deviceList.paginator = value;
    }
  }
  @ViewChild(MatSort, { static: false })
  set deivceSort(value: MatSort) {
    if (this.deviceList) {
      this.deviceList.sort = value;
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
  showSpinner: boolean;
  disableTabs: boolean;
  saveFilter: string;

  @Input() set selectionObjInput1(searchModelInput: string) {
    this._selectionObjInput = searchModelInput;
  }
  ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    public route: ActivatedRoute,
    private router: Router,
    public utility: UtilityService,
    public searchUtility: SearchUtilityService,
    public adhocUtility: AdhocReportutilityService,
    private coreService: CoreUtilityService,
    private search: SearchServiceService,
    private tenantService: TenantService,) {
    this.selectItem(this.coreService.maxRecords, 1);
    this.isSelectedItem(this.coreService.maxRecords, 1);
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
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
    this.utility.entitySelected = "Device"
    if (localStorage.getItem('ItemPerPage') !== null) {
      this.currentPageSize = +localStorage.getItem('ItemPerPage');
      this.size = +localStorage.getItem('ItemPerPage');
    }
    else {
      this.currentPageSize = 10;
      this.size = 10;
    }
    this.deviceList = new MatTableDataSource();
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.model.keyWord = params.keyword;
      this.model.objectType = params.objectType;
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.app = params.app;
      this.isDetails = params.isDetails;
      if (this.adhocUtility.keyWord) {
        this.model.keyWord = this.adhocUtility.keyWord;
      } else {
        this.adhocUtility.keyWord = '';
      }
      this.model = this.model;
      if (this.model.keyWord !== '') {
        this.adhocUtility.keyWord = this.model.keyWord;
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
  }

  getTenants() {
    this.tenantService.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      tenant => {
        this.tenants = tenant;
        if (tenant === undefined) {
          return;
        }
        this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
        this.model.userId = this.tenantService.currentTenantValue.userId;
        if (this.tenantService.currentTenantValue.tenantName != this.coreService.previousTenant) {
          this.coreService.previousTenant = this.tenantService.currentTenantValue.tenantName;
          this.model.tenantId = tenant.tenantId;
          if (this.adhocUtility.saveFilter) {
            if (this.adhocUtility.keyWord) {
              this.model.keyWord = this.adhocUtility.keyWord;
            }
            else {
              this.model.keyWord = '';
            }
          }
          this.filter = '';
          this.adhocUtility.saveFilter = '';
          this.adhocUtility.checkedList = [];


        }
        if (this.model.objectType != undefined) {
          this.model.pageNumber = 1;
          this.getSearchResults(this.model);
        }
      }, err => {
        console.log(err);
      });
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
    this.pageSize = pageEvent.pageSize;
    this.startingIndex = pageEvent.pageIndex * pageEvent.pageSize,
      this.endingIndex = this.startingIndex + (pageEvent.pageSize < (pageEvent.length - this.startingIndex) ? pageEvent.pageSize : (pageEvent.length - this.startingIndex));
    this.isDisable = false;
    if (this.model.DevNum == null) {
      pageEvent.previousPageIndex = pageEvent.pageIndex;
      setTimeout(() => { this.deviceList.paginator.length = this.dataLength; });
      if ((this.endingIndex + this.pageSize) > this.length && this.length != this.dataLength) {
        this.isDisable = true;
        this.model.pageNumber = Math.round(this.dataLength / this.length);
        this.search
          .getDeviceList(this.model)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(data => {
            this.deviceList = new MatTableDataSource(data.table);
            this.deviceList.data = data.table.concat(this.deviceData);
            this.deviceData = this.deviceList.data;
            setTimeout(() => {
              this.deviceList.paginator.pageIndex = pageEvent.pageIndex;
              this.deviceList.paginator.length = this.dataLength;
            });

            //  this.getData({ pageIndex: this.page, pageSize: this.size });
            if (
              (this.adhocUtility.adhocPreviousRoute == '/appAdhoc/search') ||
              (this.adhocUtility.adhocPreviousRoute ==
                '/search/alarm/alarmDetail?objectType=' +
                this.model.objectType +
                '&sid=' +
                this.adhocUtility.paramSid +
                '&isDetails=true&app=search' || this.adhocUtility.adhocPreviousRoute ==
                '/search/trendlog/trendlog?objectType=' +
                this.model.objectType +
                '&sid=' +
                this.adhocUtility.paramSid +
                '&isDetails=true&app=search' ||
                this.adhocUtility.adhocPreviousRoute ==
                '/home/deviceList/searchdetails?objectType=Device&DevNum=' +
                this.adhocUtility.paramDevNum +
                '&isDetails=true' || this.adhocUtility.adhocPreviousRoute ==
                '/home/search/alarm/deviceDetail?objectType=Device&DevNum=' +
                this.adhocUtility.paramDevNum +
                '&isDetails=true&app=' + this.model.app ||
                this.adhocUtility.adhocPreviousRoute == '/search/alarm?objectType=Alarm&DevNum=' +
                this.adhocUtility.paramDevNum + '&isDetails=true&app=' + this.model.app ||
                this.adhocUtility.adhocPreviousRoute == '/search/trendlog?objectType=Trendlog&DevNum=' +
                this.adhocUtility.paramDevNum + '&isDetails=true&app=' + this.model.app ||
                this.adhocUtility.adhocPreviousRoute == '/searchobj/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
                this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' ||
                this.adhocUtility.adhocPreviousRoute == '/search/alarm/alarmDetail?objectType=Alarm&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
                this.adhocUtility.adhocPreviousRoute == '/search/points/pointDetail?objectType=Points&sid=' + this.adhocUtility.paramSid + '&isDetails=true' ||
                this.adhocUtility.adhocPreviousRoute == '/searchobj/points/pointDetail?objectType=Points&sid=' + this.adhocUtility.paramSid + '&isDetails=true' ||
                this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' ||
                this.adhocUtility.adhocPreviousRoute == '/searchobj/alarm/alarmDetail?objectType=Alarm&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
                this.adhocUtility.adhocPreviousRoute == '/search/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
                this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' ||
                this.adhocUtility.adhocPreviousRoute == '/searchobj/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
                this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search')
            ) {
              this.filter = this.adhocUtility.saveFilter;
              if (this.adhocUtility.checkedList.length > 0) {
                this.adhocUtility.checkedList.forEach(s => {
                  this.deviceList.data.forEach(l => {
                    if (s.sid == l["sid"]) {
                      l["checked"] = true;
                      return;
                    }
                  });
                });
              }
              // this.checked();
            } else {
              this.filter = '';
              this.showPlot = false;
              this.adhocUtility.checkedList = [];
              this.adhocUtility.checkNames = [];
            }

            this.showSpinner = false;
            this.disableTabs = true;
            this.isDisable = false;
          });
      }
      else {
        return;
      }
    }
  }

  getSearchResults(searchObjects) {
    this.showSpinner = true;
    this.search
      .getDeviceList(searchObjects)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        this.deviceList = new MatTableDataSource(data.table);
        this.deviceData = data.table;
        this.deviceList.sort = this.deivceSort;
        this.deviceList.paginator = this.deivcePaginator;
        this.dataLength = data.table1[0].totalCount;
        setTimeout(() => { this.deviceList.paginator.length = this.dataLength; });
        this.length = this.deviceList.data.length;
        this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size, length: this.length });
        if (
          (this.adhocUtility.adhocPreviousRoute == '/appAdhoc/search') ||
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
            '/home/deviceList/searchdetails?objectType=Device&DevNum=' +
            this.adhocUtility.paramDevNum +
            '&isDetails=true' || this.adhocUtility.adhocPreviousRoute ==
            '/home/search/alarm/deviceDetail?objectType=Device&DevNum=' +
            this.adhocUtility.paramDevNum +
            '&isDetails=true&app=' + this.model.app ||
            this.adhocUtility.adhocPreviousRoute == '/search/alarm?objectType=Alarm&DevNum=' +
            this.adhocUtility.paramDevNum + '&isDetails=true&app=' + this.model.app ||
            this.adhocUtility.adhocPreviousRoute == '/search/trendlog?objectType=Trendlog&DevNum=' +
            this.adhocUtility.paramDevNum + '&isDetails=true&app=' + this.model.app ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/search/alarm/alarmDetail?objectType=Alarm&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/search/points/pointDetail?objectType=Points&sid=' + this.adhocUtility.paramSid + '&isDetails=true' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/points/pointDetail?objectType=Points&sid=' + this.adhocUtility.paramSid + '&isDetails=true' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/alarm/alarmDetail?objectType=Alarm&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/search/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search')
        ) {
          this.filter = this.adhocUtility.saveFilter;
          if (this.adhocUtility.checkedList.length > 0) {
            this.adhocUtility.checkedList.forEach(s => {
              this.deviceList.data.forEach(l => {
                if (s.sid == l["sid"]) {
                  l["checked"] = true;
                  return;
                }
              });
            });
          }
          // this.checked();
        } else {
          this.filter = '';
          this.showPlot = false;
          this.adhocUtility.checkedList = [];
          this.adhocUtility.checkNames = [];
        }

        this.showSpinner = false;
        this.disableTabs = true;
      });
  }
  getSearchResultsByFilter(searchObjects) {
    this.showSpinner = true;
    this.search
      .getDeviceList(searchObjects)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        this.deviceList = new MatTableDataSource(data.table);
        this.deviceData = data.table;
        this.deviceList.sort = this.deivceSort;
        this.deviceList.paginator = this.deivcePaginator;
        if (this.model.DevNum == null || this.model.DevNum == '') {
          this.dataLength = data.table1[0].totalCount;
        }
        this.length = this.deviceList.data.length;
        this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size, length: this.length });
        if (
          (this.adhocUtility.adhocPreviousRoute == '/appAdhoc/search') ||
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
            '/home/deviceList/searchdetails?objectType=Device&DevNum=' +
            this.adhocUtility.paramDevNum +
            '&isDetails=true' || this.adhocUtility.adhocPreviousRoute ==
            '/home/search/alarm/deviceDetail?objectType=Device&DevNum=' +
            this.adhocUtility.paramDevNum +
            '&isDetails=true&app=' + this.model.app ||
            this.adhocUtility.adhocPreviousRoute == '/search/alarm?objectType=Alarm&DevNum=' +
            this.adhocUtility.paramDevNum + '&isDetails=true&app=' + this.model.app ||
            this.adhocUtility.adhocPreviousRoute == '/search/trendlog?objectType=Trendlog&DevNum=' +
            this.adhocUtility.paramDevNum + '&isDetails=true&app=' + this.model.app ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/search/alarm/alarmDetail?objectType=Alarm&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/search/points/pointDetail?objectType=Points&sid=' + this.adhocUtility.paramSid + '&isDetails=true' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/points/pointDetail?objectType=Points&sid=' + this.adhocUtility.paramSid + '&isDetails=true' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/alarm/alarmDetail?objectType=Alarm&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/search/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' ||
            this.router.url == "/searchobj/device?objectType=Device&app=adhoc" ||
            this.router.url == "/search/device?objectType=Device&app=search" ||
            this.router.url == "/searchobj/device?objectType=Device&app=search" ||
            this.router.url == "/search/device?objectType=Device&app=adhoc")
        ) {
          this.filter = this.adhocUtility.saveFilter;
          if (this.adhocUtility.checkedList.length > 0) {
            this.adhocUtility.checkedList.forEach(s => {
              this.deviceList.data.forEach(l => {
                if (s.sid == l["sid"]) {
                  l["checked"] = true;
                  return;
                }
              });
            });
          }
          // this.checked();
        } else {

          this.showPlot = false;
          this.adhocUtility.checkedList = [];
          this.adhocUtility.checkNames = [];
        }

        this.showSpinner = false;
        this.disableTabs = true;
      });
  }
  applyFilter(filterValue: string, event) {
    if (event.keyCode === 20 || event.keyCode === 9) {
      return;
    }
    //filterValue = filterValue.trim(); // Remove whitespace

    let temp = filterValue;
    temp = temp.trim();
    //  temp = temp.toLowerCase(); // MatTabledataSource defaults to lowercase matches
    this.deviceList.filter = temp;
    //this.filter = temp;
    this.adhocUtility.saveFilter = temp;
    this.model.objectType = 'Device';
    this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
    this.model.userId = this.tenantService.currentTenantValue.userId;
    this.model.keyWord = temp == '' ? null : temp;
    this.model.pageNumber = 1;
    this.getSearchResultsByFilter(this.model);

  }

  filterByKey(filterValue: string, event) {
    if (event.keyCode === 20 || event.keyCode === 9) {
      return;
    }

    let temp = filterValue;
    temp = temp.trim();
    temp = temp.toLowerCase(); // MatTabledeviceList defaults to lowercase matches
    this.deviceList.filter = temp;
    //this.filter = temp;
    this.adhocUtility.saveFilter = temp;
    if (this.deviceList.filteredData.length > 0 && temp == '' && event.keyCode === 8) {
      this.model.objectType = 'Device';
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.app = this.model.app;
      this.model.keyWord = temp == '' ? null : temp;
      if (this.adhocUtility.keyWord) {
        this.model.keyWord = this.adhocUtility.keyWord;
        temp = this.model.keyWord;
      }
      this.getSearchResultsByFilter(this.model);
    }
    if (this.deviceList.filteredData.length == 0 && temp == '' && event.keyCode === 8) {
      this.model.objectType = 'Device';
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.app = this.model.app;
      this.model.keyWord = temp == '' ? null : temp;
      if (this.adhocUtility.keyWord) {
        this.model.keyWord = this.adhocUtility.keyWord;
        temp = this.model.keyWord;
      }
      this.getSearchResultsByFilter(this.model);
    }
  }


  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  ngAfterViewInit() {
    this.deviceList.paginator = this.deivcePaginator;
    this.deviceList.sort = this.deivceSort;
  }
}
