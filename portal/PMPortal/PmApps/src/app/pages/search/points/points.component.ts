import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchUtilityService } from '../search-utility.service';
import { UtilityService } from 'src/app/PmCore/services/utility.service';
import { Location } from '@angular/common';
import { AdhocReportutilityService } from 'projects/AppAdhoc/src/app/adhoc-reportutility.service';
import { TenantService, SearchServiceService } from 'src/app/PmCore/services';
import { Subject } from 'rxjs';
import { CommonModel } from 'src/app/PmModel/common.model';
import { takeUntil } from 'rxjs/operators';
import { Search } from 'src/app/PmModel/search.model';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';

import { ToolbarComponent } from 'src/app/layout';
import { AppUtilService } from 'src/app/PmCore/shared/app-util.service';
@Component({
  selector: 'app-points',
  templateUrl: './points.component.html',
  styleUrls: ['./points.component.scss']
})
export class PointsComponent implements OnInit {
  // MatPaginator Inputs
  length: number;
  pageSize = 10;
  currentPageIndex = 0;
  currentPageSize = 10;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  page = 0;
  size = 10;
  displayedColumns = ['name', 'pointType', 'engineeringUnit', 'instance', 'description', 'DevNum'];
  _selectionObjInput: any;
  alarmList: any;
  startingIndex: number;
  endingIndex: any;
  tenants: CommonModel;
  isDetails: any;
  public model: Search = new Search();
  regex = new RegExp('%20');
  pointList = new MatTableDataSource();
  dataLength: any;
  pointData: any;
  isDisable: boolean = false;
  // @ViewChild(MatPaginator, { static: false }) pointPaginator: MatPaginator;
  // @ViewChild(MatSort, { static: false }) pointSort: MatSort;
  @ViewChild(MatPaginator, { static: false })
  set pointPaginator(value: MatPaginator) {
    if (this.pointList) {
      this.pointList.paginator = value;
    }
  }
  @ViewChild(MatSort, { static: false })
  set pointSort(value: MatSort) {
    if (this.pointList) {
      this.pointList.sort = value;
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
    private location: Location,
    public utility: UtilityService,
    private coreService: CoreUtilityService,
    public adhocUtility: AdhocReportutilityService,
    public _utility: AppUtilService,
    private search: SearchServiceService,
    private tenantService: TenantService,
    public _toolbar: ToolbarComponent,) {
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
    var mastertenantValue = localStorage.getItem('mastertenant');
    if (mastertenantValue == "true") {
      localStorage.setItem('mastertenant', 'false');
      this.tenantService.triggerTenantSelected(this._utility.tenantId);
    }
    if (window.location.href.includes('searchobj') == true) {
      this._toolbar.enablebutton();
    }
    this.utility.entitySelected = "Points"
    if (localStorage.getItem('ItemPerPage') !== null) {
      this.currentPageSize = +localStorage.getItem('ItemPerPage');
      this.size = +localStorage.getItem('ItemPerPage');
    }
    else {
      this.currentPageSize = 10;
      this.size = 10;
    }
    this.pointList = new MatTableDataSource();
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.model.keyWord = params.keyword;
      this.model.objectType = params.objectType;
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.DevNum = params.DevNum;
      this.model.app = params.app;
      this.isDetails = params.isDetails == undefined ? 'false' : params.isDetails;

      if (this.adhocUtility.keyWord) {
        this.model.keyWord = this.adhocUtility.keyWord;
      } else {
        this.adhocUtility.keyWord = '';
      }
      this.model = this.model;
      if (this.model.keyWord !== '') {
        this.adhocUtility.keyWord = this.model.keyWord;
      }

      if (this.adhocUtility.adhocPreviousRoute == "/appAdhoc/search") {
        if (this.adhocUtility.keyWord) {
          if (this.adhocUtility.saveFilter) {
            this.model.keyWord = this.adhocUtility.saveFilter;
          }
          else {
            this.model.keyWord = this.adhocUtility.keyWord;
          }
        }
        else {
          this.model.keyWord = this.adhocUtility.saveFilter;
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
      if (this.router.url == '/searchobj/points?objectType=Points&app=search' || this.router.url == '/searchobj/points?objectType=Points&keyword=' + this.adhocUtility.keyWord + '&app=search') {
        this.utility.routerValue = true;
      } else
        if (this.router.url == '/searchobj/points?objectType=Points&DevNum=' + this.model.DevNum + '&isDetails=true&app=search' &&
          (this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&keyword=' + this.model.keyWord + '&app=search'
          )) {
          this.utility.routerValue = false;
        } else
          if (this.router.url == '/searchobj/points?objectType=Points&DevNum=' + this.model.DevNum + '&isDetails=true&app=search' &&
            (this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&app=search' ||
              this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&keyword=' + this.model.keyWord + '&app=search'
              || this.adhocUtility.adhocPreviousRoute.indexOf("%20") > 0)) {
            this.utility.routerValue = false;
          }
          else if (this.adhocUtility.adhocPreviousRoute == '/searchobj/points/pointDetail?objectType=Points&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.router.url == '/searchobj/points?objectType=Points&DevNum=' + this.adhocUtility.paramDevNum + '&isDetails=true&app=search') {
            this.utility.routerValue = false;
          }
          else if (this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&keyword=' + this.adhocUtility.keyWord + '&app=search') {
            this.utility.routerValue = false;
          } else if (this.regex.exec(this.adhocUtility.adhocPreviousRoute) !== null) {
            if (this.regex.exec(this.adhocUtility.adhocPreviousRoute)[0] === "%20") {
              this.utility.routerValue = false;
            }
          }
    }
    else {
      if (this.router.url == '/search/points?objectType=Points&app=search' || this.router.url == '/search/points?objectType=Points&keyword=' + this.adhocUtility.keyWord + '&app=search') {
        this.utility.routerValue = true;
      } else
        if (this.router.url == '/searchobj/points?objectType=Points&app=search') {
          this.utility.routerValue = true;
        }
        else
          if (this.router.url == '/search/points?objectType=Points&DevNum=' + this.model.DevNum + '&isDetails=true&app=search' &&
            (this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&app=search' ||
              this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&keyword=' + this.model.keyWord + '&app=search'
            )) {
            this.utility.routerValue = false;
          } else
            if (this.router.url == '/search/points?objectType=Points&DevNum=' + this.model.DevNum + '&isDetails=true&app=search' &&
              (this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&app=search' ||
                this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&keyword=' + this.model.keyWord + '&app=search'
                || this.adhocUtility.adhocPreviousRoute.indexOf("%20") > 0)) {
              this.utility.routerValue = false;
            }
            else if ((this.router.url == '/search/points?objectType=Energy%20Log&DevNum=' + this.model.DevNum + '&isDetails=true&app=search')) {
              this.utility.routerValue = false;
            }
            else if (this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&keyword=' + this.model.keyWord + 'app=search') {
              this.utility.routerValue = false;
            }
            else if (this.adhocUtility.adhocPreviousRoute == '/search/points/pointDetail?objectType=Points&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
              this.router.url == '/search/points?objectType=Points&DevNum=' + this.adhocUtility.paramDevNum + '&isDetails=true&app=search') {
              this.utility.routerValue = false;
              if (this.regex.exec(this.router.url) !== null) {
                if (this.regex.exec(this.router.url)[0] === "%20") {
                  this.utility.routerValue = true;
                }
              }
            }
            else if (this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&keyword=' + this.adhocUtility.keyWord + '&app=search' &&
              this.router.url == '/search/points?objectType=Points&DevNum=' + this.model.DevNum + '&isDetails=true&app=search') {
              this.utility.routerValue = false;
            } else if (this.regex.exec(this.router.url) !== null) {
              if (this.regex.exec(this.router.url)[0] === "%20") {
                this.utility.routerValue = true;
              }
            }
            else if (this.adhocUtility.adhocPreviousRoute == '/appAdhoc/search') {
              this.utility.routerValue = false;
            }
            else {
              this.utility.routerValue = true;
            }
    }


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
          this.filter = '';
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
      setTimeout(() => { this.pointList.paginator.length = this.dataLength; });
      if ((this.endingIndex + this.pageSize) > this.length && this.length != this.dataLength) {
        this.isDisable = true;
        this.model.pageNumber = Math.round(this.dataLength / this.length);
        this.search
          .getPointsList(this.model)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(data => {
            this.pointList = new MatTableDataSource(data.table);
            this.pointList.data = data.table.concat(this.pointData);
            this.pointData = this.pointList.data;
            setTimeout(() => {
              this.pointList.paginator.pageIndex = pageEvent.pageIndex;
              this.pointList.paginator.length = this.dataLength;
            });

            //   this.getData({ pageIndex: this.page, pageSize: this.size});
            // setTimeout(() => {
            // this.pointList.data = data;
            //this.pointList.data.forEach(s => (s["checked"] = false));
            // this.length = this.pointList.data.length;
            // this.getData({ pageIndex: this.page, pageSize: this.size });
            // this.pointList.paginator = this.pointPaginator;
            // this.pointList.sort = this.pointSort;
            // });
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
                '/home/pointList/searchdetails?objectType=Device&DevNum=' +
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
                  this.pointList.data.forEach(l => {
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
            this.isDisable = false;
          });
      }
      else {
        return;
      }
    }
  }

  getSearchResults(searchObjects) {
    this.length = 0;
    if (this.showSpinner === undefined) {
      this.showSpinner = true;
      this.disableTabs = false;
    } else {
      this.showSpinner = true;
      this.disableTabs = false;
    }

    this.search
      .getPointsList(searchObjects)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        this.pointList = new MatTableDataSource(data.table);
        this.pointData = data.table;
        this.length = this.pointList.data.length;
        if (this.model.DevNum == null || this.model.DevNum == '') {
          this.dataLength = data.table1[0].totalCount;
          setTimeout(() => { this.pointList.paginator.length = this.dataLength; });
        }
        this.pointList.paginator = this.pointPaginator;
        this.pointList.sort = this.pointSort;
        this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size, length: this.length });
        // setTimeout(() => {
        // this.pointList.data = data;
        //this.pointList.data.forEach(s => (s["checked"] = false));
        // this.length = this.pointList.data.length;
        // this.getData({ pageIndex: this.page, pageSize: this.size });
        // this.pointList.paginator = this.pointPaginator;
        // this.pointList.sort = this.pointSort;
        // });
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
            '/home/pointList/searchdetails?objectType=Device&DevNum=' +
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
              this.pointList.data.forEach(l => {
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
    this.length = 0;
    if (this.showSpinner === undefined) {
      this.showSpinner = true;
      this.disableTabs = false;
    } else {
      this.showSpinner = true;
      this.disableTabs = false;
    }

    this.search
      .getPointsList(searchObjects)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        this.pointList = new MatTableDataSource(data.table);
        this.pointData = data.table;
        this.length = this.pointList.data.length;
        if (this.model.DevNum == null || this.model.DevNum == '') {
          this.dataLength = data.table1[0].totalCount;
        }
        this.pointList.paginator = this.pointPaginator;
        this.pointList.sort = this.pointSort;
        this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size, length: this.length });
        // setTimeout(() => {
        // this.pointList.data = data;
        //this.pointList.data.forEach(s => (s["checked"] = false));
        // this.length = this.pointList.data.length;
        // this.getData({ pageIndex: this.page, pageSize: this.size });
        // this.pointList.paginator = this.pointPaginator;
        // this.pointList.sort = this.pointSort;
        // });
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
            '/home/pointList/searchdetails?objectType=Device&DevNum=' +
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
            this.router.url == "/searchobj/points?objectType=Points&app=adhoc" ||
            this.router.url == "/search/points?objectType=Points&app=search" ||
            this.router.url == "/searchobj/points?objectType=Points&app=search" ||
            this.router.url == "/search/points?objectType=Points&app=adhoc")
        ) {
          this.filter = this.adhocUtility.saveFilter;
          if (this.adhocUtility.checkedList.length > 0) {
            this.adhocUtility.checkedList.forEach(s => {
              this.pointList.data.forEach(l => {
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
    this.pointList.filter = temp;
    //this.filter = temp;
    this.adhocUtility.saveFilter = temp;
    this.model.objectType = 'Points';
    this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
    this.model.userId = this.tenantService.currentTenantValue.userId;
    this.model.keyWord = filterValue == '' ? null : temp;
    this.model.pageNumber = 1;
    this.getSearchResultsByFilter(this.model);

  }

  filterByKey(filterValue: string, event) {
    if (event.keyCode === 20 || event.keyCode === 9) {
      return;
    }

    let temp = filterValue;
    temp = temp.trim();
    temp = temp.toLowerCase(); // MatTablepointList defaults to lowercase matches
    this.pointList.filter = temp;
    //this.filter = temp;
    this.adhocUtility.saveFilter = temp;
    if (this.pointList.filteredData.length > 0 && temp == '' && event.keyCode === 8) {
      this.model.objectType = 'Points';
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.app = this.model.app;
      this.model.pageNumber = 1;
      if (this.adhocUtility.keyWord) {
        this.model.keyWord = this.adhocUtility.keyWord;
        temp = this.model.keyWord;
      }
      this.model.keyWord = temp == '' ? null : temp;
      this.getSearchResultsByFilter(this.model);
    }
    if (this.pointList.filteredData.length == 0 && temp == '' && event.keyCode === 8) {
      this.model.objectType = 'Points';
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.app = this.model.app;
      this.model.pageNumber = 1;
      if (this.adhocUtility.keyWord) {
        this.model.keyWord = this.adhocUtility.keyWord;
        temp = this.model.keyWord;
      }
      this.model.keyWord = temp == '' ? null : temp;
      this.getSearchResultsByFilter(this.model);
    }
  }

  applyFilter1(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.pointList.filter = filterValue;
  }

  backParent() {
    this.location.back();
  }
  ngAfterViewInit() {
    this.pointList.paginator = this.pointPaginator;
    this.pointList.sort = this.pointSort;
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
