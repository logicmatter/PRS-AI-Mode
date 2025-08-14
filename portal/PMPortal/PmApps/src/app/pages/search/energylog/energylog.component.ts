import { Component, OnInit, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportingService, SearchServiceService, TenantService, UserService } from 'src/app/PmCore/services';
import { UtilityService } from 'src/app/PmCore/services/utility.service';
import { AdhocReportutilityService } from 'projects/AppAdhoc/src/app/adhoc-reportutility.service';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
import { CommonModel } from 'src/app/PmModel/common.model';
import { Search } from 'src/app/PmModel/search.model';
import { takeUntil } from 'rxjs/operators';
import { AppUtilService, DeleteDialog } from 'src/app/PmCore/shared/app-util.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSortable } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';
import { Location } from '@angular/common';
import { SearchUtilityService } from '../search-utility.service';
import { ToolbarComponent } from 'src/app/layout';
import { Trailicmodel } from 'src/app/PmModel/trailicmodel.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import cloneDeep from 'lodash/cloneDeep';
import clonedeep from 'lodash.clonedeep';
@Component({
  selector: 'app-energylog',
  templateUrl: './energylog.component.html',
  styleUrls: ['./energylog.component.scss']
})
export class EnergylogComponent implements OnInit {
  // MatPaginator Inputs
  length: number;
  pageSize = 10;
  currentPageIndex = 0;
  currentPageSize = 10;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  page = 0;
  size = 10;
  displayedColumns = ['checked', 'description', 'engineeringUnit', 'rateDevNum'];
  displayedColumns1 = ['description', 'engineeringUnit', 'rateDevNum'];
  _selectionObjInput: any;
  alarmList: any;
  startingIndex: number;
  endingIndex: any;
  tenants: CommonModel;
  isDetails: any;
  public model: Search = new Search();
  regex = new RegExp('%20');
  energyLogList = new MatTableDataSource();
  dataLength: any;
  energyData: any;
  isDisable: boolean = false;
  dummyreportID: any;
  // @ViewChild(MatPaginator, {static: false}) energyLogPaginator: MatPaginator;
  // @ViewChild(MatSort, {static: false}) energyLogSort: MatSort;
  @ViewChild(MatPaginator, { static: false })
  set energyLogPaginator(value: MatPaginator) {
    if (this.energyLogList) {
      this.energyLogList.paginator = value;
    }
  }
  @ViewChild(MatSort, { static: false })
  set energyLogSort(value: MatSort) {
    if (this.energyLogList) {
      this.energyLogList.sort = value;
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
  sortDirection;
  sortProperty;
  public AdditionalData: Trailicmodel = new Trailicmodel();
  @Input() set selectionObjInput1(searchModelInput: string) {
    this._selectionObjInput = searchModelInput;
  }
  ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    public route: ActivatedRoute,
    private location: Location,
    private router: Router,
    public utility: UtilityService,
    private coreService: CoreUtilityService,
    private search: SearchServiceService,
    public _utility: AppUtilService,
    public adhocUtility: AdhocReportutilityService,
    public searchUtility: SearchUtilityService,
    private cdr: ChangeDetectorRef,
    private tenantService: TenantService,
    private dialog: MatDialog,
    public _toolbar: ToolbarComponent,
    private _rptService: ReportingService,
  ) {

    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    this.selectItem(this.coreService.maxRecords, 1);
    this.isSelectedItem(this.coreService.maxRecords, 1);
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
    // this.utility.entitySelected = "Energylog"

      this.utility.entitySelected = "Energylog"
      if (window.location.href.includes('searchobj') == true) {
        this._toolbar.enablebutton();
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
    this.energyLogList = new MatTableDataSource();
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.model.keyWord = params.keyword;
      this.model.objectType = params.objectType;
      if (this.model.objectType == 'Energy Log') {
        this.model.objectType = 'Energylog';
      }
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.app = params.app;
      this.model.DevNum = params.DevNum;
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
      if (this.router.url == '/searchobj/energylog?objectType=Energylog&app=search' || this.router.url == '/searchobj/energylog?objectType=Energylog&keyword=' + this.adhocUtility.keyWord + '&app=search') {
        this.utility.routerValue = true;
      } else
        if (this.router.url == '/searchobj/energylog?objectType=Energylog&DevNum=' + this.model.DevNum + '&isDetails=true&app=search' &&
          (this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&keyword=' + this.model.keyWord + '&app=search'
          )) {
          this.utility.routerValue = false;
        } else
          if (this.router.url == '/searchobj/energylog?objectType=Energylog&DevNum=' + this.model.DevNum + '&isDetails=true&app=search' &&
            (this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&app=search' ||
              this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&keyword=' + this.model.keyWord + '&app=search'
              || this.adhocUtility.adhocPreviousRoute.indexOf("%20") > 0)) {
            this.utility.routerValue = false;
          }
          else if (this.adhocUtility.adhocPreviousRoute == '/searchobj/energylog/alarmDetail?objectType=Energylog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.router.url == '/searchobj/energylog?objectType=Energylog&DevNum=' + this.model.DevNum + '&isDetails=true&app=search') {
            this.utility.routerValue = false;
          }
          else if (this.router.url != '/searchobj/energylog?objectType=Energylog&app=search' && this.adhocUtility.adhocPreviousRoute == '/appAdhoc/search') {
            this.utility.routerValue = true;
            if (this.router.url == '/searchobj/energylog?objectType=Energylog&DevNum=' + this.adhocUtility.paramDevNum + '&isDetails=true&app=search' &&
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
      if (this.adhocUtility.keyWord == undefined) {
        this.adhocUtility.keyWord = '';
      }
      if (this.router.url == '/search/energylog?objectType=Energylog&app=search' || this.router.url == '/search/energylog?objectType=Energy%20Log&keyword=' + this.adhocUtility.keyWord + '&app=search' || this.router.url == '/search/energylog?objectType=Energylog&keyword=' + this.adhocUtility.keyWord + '&app=search' || this.router.url == '/search/energylog?objectType=Energy%20Log&app=adhoc' || this.router.url == '/search/energylog?objectType=Energy%20Log&app=search' || this.router.url == '/search/energylog?objectType=Energylog&keyword=' + this.adhocUtility.keyWord + '&app=adhoc') {
        this.utility.routerValue = true;
      }
      else
        if (this.router.url == '/search/energylog?objectType=Energylog&DevNum=' + this.model.DevNum + '&isDetails=true&app=search' &&
          (this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&keyword=' + this.model.keyWord + '&app=search'
          )) {
          this.utility.routerValue = false;
        } else
          if (this.router.url == '/search/energylog?objectType=Energylog&DevNum=' + this.model.DevNum + '&isDetails=true&app=search' &&
            (this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&app=search' ||
              this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&keyword=' + this.model.keyWord + '&app=search'
              || this.adhocUtility.adhocPreviousRoute.indexOf("%20") > 0)) {
            this.utility.routerValue = false;
          }
          else if ((this.router.url == '/search/energylog?objectType=Energylog&DevNum=' + this.model.DevNum + '&isDetails=true&app=search' &&
            this.adhocUtility.adhocPreviousRoute == '/appAdhoc/search')) {
            this.utility.routerValue = false;
          }
          else if (this.adhocUtility.adhocPreviousRoute == "/search/energylog/deviceDetail?objectType=Device&DevNum=" + this.model.DevNum + '&isDetails=true&app=search') {
            this.utility.routerValue = false;
          }
          else if (this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&keyword=' + this.model.keyWord + 'app=search') {
            this.utility.routerValue = false;
          }
          else if (this.router.url != '/search/energylog?objectType=Energylog&app=search' && this.adhocUtility.adhocPreviousRoute == '/appAdhoc/search') {
            this.utility.routerValue = true;
          }
          else if (this.adhocUtility.adhocPreviousRoute == '/search/energylog/energyDetail?objectType=Energylog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search') {
            this.utility.routerValue = false;
            if (this.adhocUtility.adhocPreviousRoute == '/search/energylog/energyDetail?objectType=Energylog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' &&
              this.router.url == '/search/energylog?objectType=Energylog&app=search') {
              this.utility.routerValue = true;
            }
            if (this.regex.exec(this.router.url) !== null) {
              if (this.regex.exec(this.router.url)[0] === "%20") {
                this.utility.routerValue = true;
              }
            }
          }
          else if (this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&keyword=' + this.adhocUtility.keyWord + '&app=search' &&
            this.router.url == '/search/energylog?objectType=Energylog&DevNum=' + this.model.DevNum + '&isDetails=true&app=search') {
            this.utility.routerValue = false;
          } else if (this.regex.exec(this.router.url) !== null) {
            if (this.regex.exec(this.router.url)[0] === "%20") {
              this.utility.routerValue = true;
            }
          }
          else {
            this.utility.routerValue = true;
          }
    }
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
  getTenants() {
    this.tenantService.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      tenant => {
        this.tenants = tenant;
        if (tenant.tenantId === undefined) {
          return;
        }
        this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
        this.model.userId = this.tenantService.currentTenantValue.userId;
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

        }
        if (this.model.objectType != undefined) {
          this.model.pageNumber = 1;
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
      setTimeout(() => { this.energyLogList.paginator.length = this.dataLength; });
      if ((this.endingIndex + this.pageSize) > this.length && this.length != this.dataLength) {
        this.isDisable = true;
        this.model.pageNumber = Math.round(this.dataLength / this.length);
        this.search
          .getEnergyList(this.model)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(data => {
            // setTimeout(() => {
            this.energyLogList.data = data.table;
            this.energyLogList.data = data.table.concat(this.energyData);
            this.energyData = this.energyLogList.data;
            setTimeout(() => {
              this.energyLogList.paginator.pageIndex = pageEvent.pageIndex;
              this.energyLogList.paginator.length = this.dataLength;
            });
            //   this.getData({ pageIndex: this.page, pageSize: this.size});
            this.energyLogList.data.forEach(s => (s["checked"] = false));

            // });
            if (
              (this.adhocUtility.adhocPreviousRoute == '/appAdhoc/search') ||
              (this.adhocUtility.adhocPreviousRoute ==
                '/search/energylog/energylogDetail?objectType=' +
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
                '/home/searchList/searchdetails?objectType=Device&DevNum=' +
                this.adhocUtility.paramDevNum +
                '&isDetails=true' || this.adhocUtility.adhocPreviousRoute ==
                '/home/search/energylog/deviceDetail?objectType=Device&DevNum=' +
                this.adhocUtility.paramDevNum +
                '&isDetails=true&app=' + this.model.app ||
                this.adhocUtility.adhocPreviousRoute == '/search/energylog?objectType=Energylog&DevNum=' +
                this.adhocUtility.paramDevNum + '&isDetails=true&app=' + this.model.app ||
                this.adhocUtility.adhocPreviousRoute == '/search/trendlog?objectType=Trendlog&DevNum=' +
                this.adhocUtility.paramDevNum + '&isDetails=true&app=' + this.model.app ||
                this.adhocUtility.adhocPreviousRoute == '/searchobj/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
                this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' ||
                this.adhocUtility.adhocPreviousRoute == '/search/energylog/energylogDetail?objectType=Energylog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
                this.adhocUtility.adhocPreviousRoute == '/search/points/pointDetail?objectType=Points&sid=' + this.adhocUtility.paramSid + '&isDetails=true' ||
                this.adhocUtility.adhocPreviousRoute == '/searchobj/points/pointDetail?objectType=Points&sid=' + this.adhocUtility.paramSid + '&isDetails=true' ||
                this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' ||
                this.adhocUtility.adhocPreviousRoute == '/searchobj/energylog/energylogDetail?objectType=Energylog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
                this.adhocUtility.adhocPreviousRoute == '/search/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
                this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' ||
                this.adhocUtility.adhocPreviousRoute == '/searchobj/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
                this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' || (this._utility.selectedItems != null && this.model.app == 'app'))
            ) {

              if (this.model.app == 'app') {
                // this.filter = '';
                // this.adhocUtility.saveFilter = '';
                if (this._utility.selectedItems.length > 0) {
                  var temp = new Array();
                  this._utility.selectedItems.forEach(s => {
                    if (typeof s[0] == "string" || typeof s == "number") {
                      this.energyLogList.data.forEach(l => {
                        if (s == l["sid"]) {
                          temp.push({ "sid": Number(s), "description": l["description"], "engineeringUnit": l["engineeringUnit"], "rateDevNum": l["rateDevNum"], "checked": true });
                        }
                      });
                    }
                    else {
                      this.energyLogList.data.forEach(l => {
                        if (s.sid == l["sid"]) {
                          temp.push({ "sid": l["sid"], "description": l["description"], "engineeringUnit": l["engineeringUnit"], "rateDevNum": l["rateDevNum"], "checked": true });
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
                  this.energyLogList.data.forEach(l => {
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
      }
      else {
        return;
      }
    }
  }
  getSearchResults(searchObjects) {
    this.showSpinner = true;
    this.length = 0;
    this.search
      .getEnergyList(searchObjects)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        // setTimeout(() => {
        this.energyLogList.data = data.table;
        this.energyData = data.table;
        this.length = this.energyLogList.data.length;
        if (this.model.DevNum == null || this.model.DevNum == '') {
          this.dataLength = data.table1[0].totalCount;
          setTimeout(() => { this.energyLogList.paginator.length = this.dataLength; });
        }
        else {
          this.dataLength = this.energyLogList.data.length;
        }
        this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size, length: this.length });
        this.energyLogList.data.forEach(s => (s["checked"] = false));
        // });
        if (
          (this.adhocUtility.adhocPreviousRoute == '/appAdhoc/search') ||
          (this.adhocUtility.adhocPreviousRoute ==
            '/search/energylog/energylogDetail?objectType=' +
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
            '/home/search/energylog/deviceDetail?objectType=Device&DevNum=' +
            this.adhocUtility.paramDevNum +
            '&isDetails=true&app=' + this.model.app ||
            this.adhocUtility.adhocPreviousRoute == '/search/energylog?objectType=Energylog&DevNum=' +
            this.adhocUtility.paramDevNum + '&isDetails=true&app=' + this.model.app ||
            this.adhocUtility.adhocPreviousRoute == '/search/trendlog?objectType=Trendlog&DevNum=' +
            this.adhocUtility.paramDevNum + '&isDetails=true&app=' + this.model.app ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/search/energylog/energylogDetail?objectType=Energylog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/search/points/pointDetail?objectType=Points&sid=' + this.adhocUtility.paramSid + '&isDetails=true' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/points/pointDetail?objectType=Points&sid=' + this.adhocUtility.paramSid + '&isDetails=true' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/energylog/energylogDetail?objectType=Energylog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/search/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' || (this._utility.selectedItems != null && this.model.app == 'app'))
        ) {

          if (this.model.app == 'app') {
            // this.filter = '';
            // this.adhocUtility.saveFilter = '';
            if (this._utility.selectedItems.length > 0) {
              var temp = new Array();
              this._utility.selectedItems.forEach(s => {
                if (typeof s[0] == "string" || typeof s == "number") {
                  this.energyLogList.data.forEach(l => {
                    if (s == l["sid"]) {
                      temp.push({ "sid": Number(s), "description": l["description"], "engineeringUnit": l["engineeringUnit"], "rateDevNum": l["rateDevNum"], "checked": true });
                    }
                  });
                }
                else {
                  this.energyLogList.data.forEach(l => {
                    if (s.sid == l["sid"]) {
                      temp.push({ "sid": l["sid"], "description": l["description"], "engineeringUnit": l["engineeringUnit"], "rateDevNum": l["rateDevNum"], "checked": true });
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
              this.energyLogList.data.forEach(l => {
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
  getSearchResultsByFilter(searchObjects) {
    this.showSpinner = true;
    this.length = 0;
    this.search
      .getEnergyList(searchObjects)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        // setTimeout(() => {
        this.energyLogList.data = data.table;
        this.energyData = data.table;
        this.energyLogList.data.forEach(s => (s["checked"] = false));
        if (this.model.DevNum == null || this.model.DevNum == '') {
          this.dataLength = data.table1[0].totalCount;
          setTimeout(() => { this.energyLogList.paginator.length = this.dataLength; });
        }
        this.length = this.energyLogList.data.length;
        this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size, length: this.length });
        this.energyLogList.paginator = this.energyLogPaginator;
        this.energyLogList.sort = this.energyLogSort;
        // });
        if (
          (this.adhocUtility.adhocPreviousRoute == '/appAdhoc/search') ||
          (this.adhocUtility.adhocPreviousRoute ==
            '/search/energylog/energylogDetail?objectType=' +
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
            '/home/search/energylog/deviceDetail?objectType=Device&DevNum=' +
            this.adhocUtility.paramDevNum +
            '&isDetails=true&app=' + this.model.app ||
            this.adhocUtility.adhocPreviousRoute == '/search/energylog?objectType=Energylog&DevNum=' +
            this.adhocUtility.paramDevNum + '&isDetails=true&app=' + this.model.app ||
            this.adhocUtility.adhocPreviousRoute == '/search/trendlog?objectType=Trendlog&DevNum=' +
            this.adhocUtility.paramDevNum + '&isDetails=true&app=' + this.model.app ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/search/energylog/energylogDetail?objectType=Energylog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/search/points/pointDetail?objectType=Points&sid=' + this.adhocUtility.paramSid + '&isDetails=true' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/points/pointDetail?objectType=Points&sid=' + this.adhocUtility.paramSid + '&isDetails=true' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/energylog/energylogDetail?objectType=Energylog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/search/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' || (this._utility.selectedItems != null && this.model.app == 'app') ||
            this.router.url == "/searchobj/energylog?objectType=Energylog&app=adhoc" ||
            this.router.url == "/search/energylog?objectType=Energy%20Log&app=search" ||
            this.router.url == "/searchobj/energylog?objectType=Energylog&app=search" ||
            this.router.url == "/search/energylog?objectType=Energy%20Log&app=adhoc")
        ) {

          if (this.model.app == 'app') {
            // this.filter = '';
            // this.adhocUtility.saveFilter = '';
            if (this._utility.selectedItems.length > 0) {
              var temp = new Array();
              this._utility.selectedItems.forEach(s => {
                if (typeof s[0] == "string" || typeof s == "number") {
                  this.energyLogList.data.forEach(l => {
                    if (s == l["sid"]) {
                      temp.push({ "sid": Number(s), "description": l["description"], "engineeringUnit": l["engineeringUnit"], "rateDevNum": l["rateDevNum"], "checked": true });
                    }
                  });
                }
                else {
                  this.energyLogList.data.forEach(l => {
                    if (s.sid == l["sid"]) {
                      temp.push({ "sid": l["sid"], "description": l["description"], "engineeringUnit": l["engineeringUnit"], "rateDevNum": l["rateDevNum"], "checked": true });
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
              this.energyLogList.data.forEach(l => {
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

  onListDrop(event: CdkDragDrop<string[]>) {
    this.energyLogList.sort.active = this.energyLogList.sort.active == "checked" ? "" : "";
    this._utility.selectedItems = [];
    this.energyLogList.data.forEach((element, i) => {
      console.log(`Moving item from ${event.previousIndex} to index ${event.currentIndex}`);
      if (element["checked"] == true) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        console.log(`event.container ${event.container.data}`)
        this.energyLogList.data = clonedeep(this.energyLogList.data);
      }
    });
    if (this.adhocUtility.checkedList.length > 0) {
      this.energyLogList.data.forEach(l => {
        if (l["checked"] == true) {
          this._utility.selectedItems.push({ "description": l["description"], "engineeringUnit": l["engineeringUnit"], "rateDevNum": l["rateDevNum"],"sid" : l["sid"],"checked":  l["checked"] });
          console.log(this._utility.selectedItems);
        }
      });
    }
    this.adhocUtility.checkedList = this._utility.selectedItems;
  }


  swapPositions = (array, a, b) => {
    [array[a], array[b]] = [array[b], array[a]]
  }
  checked() {
    this.key = '';
    this.reverse = false;
    this.tempAray = [];
    this.tempAray = this.energyLogList.data;
    if (this.adhocUtility.checkedList.length > 0) {
      this.adhocUtility.checkedList.forEach(s => {
        this.tempAray.forEach((l, i) => {
          if (s.sid == l.sid) {
            this.energyLogList.data.splice(i, 1);
            return;
          }
        });
      });
    }
    const tempArray1 = [...this.adhocUtility.checkedList, ...this.energyLogList.data];
    this.energyLogList.data = tempArray1.map((item: any) => ({ ...item }));
    this.sortProperty = 'checked';
    this.sortDirection = 'desc';
    if (this.energyLogList.sort) {
      this.energyLogList.sort.active = this.energyLogList.sort.active != "checked" ? "checked" : "checked";
      this.energyLogList.sort.direction = "desc";
    }

    if (this.energyLogList.paginator) {
      this.energyLogList.paginator.firstPage();
      this.energyLogList.paginator.length = this.dataLength;
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
    if (this._utility.licenseInfo.isLimitedEdition)
     {
      if(this._utility.reportID == "")
      {
        this.dummyreportID = -1;
      }
      else
      {
        this.dummyreportID = this._utility.reportID;
      }
      this._rptService.getReportObjectExistsByRooms(this.dummyreportID, obj.sid, this._utility.tenantID, this._utility.appID, obj.checked)
      .subscribe(response => {
        if (response) {
          const updateItem = this.adhocUtility.checkedList.find(this.findIndexToUpdate, obj.sid);
          if (this.model.objectType == 'Trendlog') {
            const updateObjName = this.adhocUtility.checkNames.find(this.findIndexToUpdate1, obj.logDescription + obj.trendlogName);
            this.index1 = this.adhocUtility.checkNames.indexOf(updateObjName);
          } else {
            const updateObjName = this.adhocUtility.checkNames.find(this.findIndexToUpdate2, obj.description);
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

        }
        else
        {
          obj.checked = false;
          const dialogRef = this.dialog.open(DeleteDialog, {
            width: "390px",
            data: {
              id: 0,
              type: '',
              message: 'Reached the Object limit in this Edition.<br/>  Please contact LogicMatter at <b>support@logicmatter.com</b>',
              action: "Warning",
              title: "Info"
            }
          });
          return;

        }
      }, error => {
        console.error('Error:', error);
      });

    }
    else
    {
      const updateItem = this.adhocUtility.checkedList.find(this.findIndexToUpdate, obj.sid);
      if (this.model.objectType == 'Trendlog') {
        const updateObjName = this.adhocUtility.checkNames.find(this.findIndexToUpdate1, obj.logDescription + obj.trendlogName);
        this.index1 = this.adhocUtility.checkNames.indexOf(updateObjName);
      } else {
        const updateObjName = this.adhocUtility.checkNames.find(this.findIndexToUpdate2, obj.description);
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
    }
  }
  clearSelection() {
    this.energyLogList.data.filter(g => {
      g["checked"] = false;
      return true;
    });
    this.searchUtility.showPlot = false;
    this.adhocUtility.checkedList = [];
    this.adhocUtility.checkNames = [];
  }
  backParent() {
    this.location.back();
  }
  applyFilter(filterValue: string, event) {
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
    this.energyLogList.filter = temp;
    //this.filter = temp;
    this.adhocUtility.saveFilter = temp;
    this.model.objectType = 'Energylog';
    this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
    this.model.userId = this.tenantService.currentTenantValue.userId;
    this.model.appId = this._utility.appID
    this.model.keyWord = temp == '' ? null : temp;
    this.model.pageNumber = 1;
    this.getSearchResultsByFilter(this.model);

  }

  filterByKey(filterValue: string, event) {
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
    temp = temp.toLowerCase(); // MatTableenergyLogList defaults to lowercase matches
    this.energyLogList.filter = temp;
    //this.filter = temp;
    this.adhocUtility.saveFilter = temp;
    if ((this.energyLogList.filteredData.length > 0 || this.energyLogList.filteredData.length == 0) && temp == '' && event.keyCode === 8) {
      this.model.objectType = 'Energylog';
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
      this.getSearchResultsByFilter(this.model);
    }
  }

  applyFilter1(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.energyLogList.filter = filterValue;
  }
  ngAfterViewInit() {
    this.energyLogList.paginator = this.energyLogPaginator;
    this.energyLogList.sort = this.energyLogSort;
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
