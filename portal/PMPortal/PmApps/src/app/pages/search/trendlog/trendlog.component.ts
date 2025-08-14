import { SearchUtilityService } from '../search-utility.service';
import { UtilityService } from 'src/app/PmCore/services/utility.service';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
import { AdhocReportutilityService } from 'projects/AppAdhoc/src/app/adhoc-reportutility.service';
import { AppUtilService, DeleteDialog } from 'src/app/PmCore/shared/app-util.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { TenantService, SearchServiceService, ReportingService } from 'src/app/PmCore/services';
import { takeUntil } from 'rxjs/operators';
import { CommonModel } from 'src/app/PmModel/common.model';
import { Subject } from 'rxjs';
import { Search } from 'src/app/PmModel/search.model';
import { LookupServiceService } from 'src/app/PmCore/services/LookupService/lookup-service.service';
import { ToastrService } from 'ngx-toastr';
import { ToolbarComponent } from 'src/app/layout';
import { Trailicmodel } from 'src/app/PmModel/trailicmodel.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import cloneDeep from 'lodash/cloneDeep';
import clonedeep from 'lodash.clonedeep';

export interface Food {
  value: string;
  viewValue: string;
}
@Component({
  selector: 'app-trendlog',
  templateUrl: './trendlog.component.html',
  styleUrls: ['./trendlog.component.scss'],

})
export class TrendlogComponent implements OnInit {
  // MatPaginator Inputs
  length: number;
  public AdditionalData: Trailicmodel = new Trailicmodel();
  currentPageSize = 10;
  currentPageIndex = 0;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  page = 0;
  size = 10;
  displayedColumns = ['checked', 'trendlogName', 'logDescription', 'logDevNum', 'logInst', 'engineeringUnit'];
  displayedColumns1 = ['checked', 'trendlogName', 'logDescription', 'logDevNum', 'logInst', 'engineeringUnit', 'standardId'];
  displayedColumns2 = ['checked', 'site', 'room', 'roomID', 'environment',];

  _selectionObjInput: any;
  alarmList: any;
  startingIndex: number;
  endingIndex: any;
  tenants: CommonModel;
  dropdownWidth: number = 300; // Adjust the width as needed
  isDetails: any;
  public model: Search = new Search();
  regex = new RegExp('%20');
  trendlogList = new MatTableDataSource();
  standards: any;
  saveFilter: string;
  standardCount: number = 0;
  dataLength: any;
  trendlogData: any;
  isDisable: boolean = false;
  dummyreportID: any;
  // @ViewChild(MatPaginator, { static: false }) trendlogPaginator: MatPaginator;
  // @ViewChild(MatSort, { static: false }) trendlogSort: MatSort;
  @ViewChild(MatPaginator, { static: false })
  set trendlogPaginator(value: MatPaginator) {
    if (this.trendlogList) {
      this.trendlogList.paginator = value;
    }
  }
  @ViewChild(MatSort, { static: false })
  set trendlogSort(value: MatSort) {
    if (this.trendlogList) {
      this.trendlogList.sort = value;
    }
  }
  //@ViewChild('trendlogPaginator', { static: true }) trendlogPaginator: MatPaginator;
  index1: any;
  key: string;
  reverse: boolean;
  tempAray: any[];
  tempAray1: any;
  showPlot: boolean;
  filter: any;
  selectedLocation = 'all';
  selectedItems = {};
  showSpinner: boolean;
  disableTabs: boolean;
  sortDirection;
  sortProperty;
  itemList = [];
  selectedItems1 = [];
  settings = {};
  count = 6;
  tempObj = {
    PointSID: '',
    StandardSID: ''
  };
  @Input() set selectionObjInput(searchModelInput: string) {
    this._selectionObjInput = searchModelInput;
  }
  ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor(
    public route: ActivatedRoute,
    private router: Router,
    public utility: UtilityService,
    private location: Location,
    private coreService: CoreUtilityService,
    private search: SearchServiceService,
    public _utility: AppUtilService,
    public adhocUtility: AdhocReportutilityService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private tenantService: TenantService,
    public lookUpConfig: LookupServiceService,
    private toastrService: ToastrService,
    public _toolbar: ToolbarComponent,
    private _rptService: ReportingService,
    public searchUtility: SearchUtilityService,
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    this.selectItem(this.coreService.maxRecords, 1);
    this.isSelectedItem(this.coreService.maxRecords, 1);
  }
  selectItem(item, id) {
    this.selectedItems[id] = item;
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
    this.utility.entitySelected = "Trendlog"
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
    this.trendlogList = new MatTableDataSource();
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
      if (this.router.url == '/searchobj/trendlog?objectType=Trendlog&app=search' || this.router.url == '/searchobj/trendlog?objectType=Trendlog&keyword=' + this.adhocUtility.keyWord + '&app=search') {
        this.utility.routerValue = true;
      } else
        if (this.router.url == '/searchobj/trendlog?objectType=Trendlog&DevNum=' + this.model.DevNum + '&isDetails=true&app=search' &&
          (this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&keyword=' + this.model.keyWord + '&app=search'
          )) {
          this.utility.routerValue = false;
        } else
          if (this.router.url == '/searchobj/trendlog?objectType=Trendlog&DevNum=' + this.model.DevNum + '&isDetails=true&app=search' &&
            (this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&app=search' ||
              this.adhocUtility.adhocPreviousRoute == '/searchobj/device?objectType=Device&keyword=' + this.model.keyWord + '&app=search'
              || this.adhocUtility.adhocPreviousRoute.indexOf("%20") > 0)) {
            this.utility.routerValue = false;
          }
          else if (this.adhocUtility.adhocPreviousRoute == '/searchobj/trendlog/trendlogDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.router.url == '/searchobj/trendlog?objectType=Trendlog&DevNum=' + this.model.DevNum + '&isDetails=true&app=search') {
            this.utility.routerValue = false;
          }
          else if (this.router.url != '/searchobj/trendlog?objectType=Trendlog&app=search' && this.adhocUtility.adhocPreviousRoute == '/appAdhoc/search') {
            this.utility.routerValue = true;
            if (this.router.url == '/searchobj/trendlog?objectType=Trendlog&DevNum=' + this.adhocUtility.paramDevNum + '&isDetails=true&app=search' &&
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
      if (this.router.url == '/search/trendlog?objectType=Trendlog&app=search' || this.router.url == '/search/trendlog?objectType=Trendlog&keyword=' + this.adhocUtility.keyWord + '&app=search' || this.router.url == '/search/trendlog?objectType=Trendlog&keyword=' + this.adhocUtility.keyWord + '&app=adhoc') {
        this.utility.routerValue = true;
      } else
        if (this.router.url == '/search/trendlog?objectType=Trendlog&DevNum=' + this.model.DevNum + '&isDetails=true&app=search' &&
          (this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&app=search' ||
            this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&keyword=' + this.model.keyWord + '&app=search'
          )) {
          this.utility.routerValue = false;
        } else
          if (this.router.url == '/search/trendlog?objectType=Trendlog&DevNum=' + this.model.DevNum + '&isDetails=true&app=search' &&
            (this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&app=search' ||
              this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&keyword=' + this.model.keyWord + '&app=search'
              || this.adhocUtility.adhocPreviousRoute.indexOf("%20") > 0)) {
            this.utility.routerValue = false;
          }
          else if (this.adhocUtility.adhocPreviousRoute == "/search/trendlog/deviceDetail?objectType=Device&DevNum=" + this.model.DevNum + '&isDetails=true&app=search') {
            this.utility.routerValue = false;
          }
          else if ((this.router.url == '/search/trendlog?objectType=Trendlog&DevNum=' + this.model.DevNum + '&isDetails=true&app=search' &&
            this.adhocUtility.adhocPreviousRoute == '/appAdhoc/search')) {
            this.utility.routerValue = false;
          }
          else if (this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&keyword=' + this.model.keyWord + 'app=search') {
            this.utility.routerValue = false;
          }
          else if (this.router.url != '/search/trendlog?objectType=Trendlog&app=search' && this.adhocUtility.adhocPreviousRoute == '/appAdhoc/search') {
            this.utility.routerValue = true;
          }
          else if (this.adhocUtility.adhocPreviousRoute == '/search/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search') {
            this.utility.routerValue = false;
            if (this.adhocUtility.adhocPreviousRoute == '/search/trendlog/trendlogDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' &&
              this.router.url == '/search/trendlog?objectType=Trendlog&app=search') {
              this.utility.routerValue = true;
            }
            if (this.regex.exec(this.router.url) !== null) {
              if (this.regex.exec(this.router.url)[0] === "%20") {
                this.utility.routerValue = true;
              }
            }
          }
          else if (this.adhocUtility.adhocPreviousRoute == '/search/device?objectType=Device&keyword=' + this.adhocUtility.keyWord == undefined ? '' : this.adhocUtility.keyWord + '&app=search' &&
            this.router.url == '/search/trendlog?objectType=Trendlog&DevNum=' + this.model.DevNum + '&isDetails=true&app=search') {
            this.utility.routerValue = false;
          } else if (this.regex.exec(this.router.url) !== null) {
            if (this.regex.exec(this.router.url)[0] === "%20") {
              this.utility.routerValue = true;
            }
          }

          else {
            this.utility.routerValue = true;
          }
      if (this.router.url == "/search/trendlog?objectType=Trendlog&app=adhoc") {
        this.utility.routerValue = true;
      }
    }

  }

  onListDrop(event: CdkDragDrop<string[]>) {
    this.trendlogList.sort.active = this.trendlogList.sort.active == "checked" ? "" : "";
    this._utility.selectedItems = [];
    this.trendlogList.data.forEach((element, i) => {
      console.log(`Moving item from ${event.previousIndex} to index ${event.currentIndex}`);
      if (element["checked"] == true) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        console.log(`event.container ${event.container.data}`)
        this.trendlogList.data = clonedeep(this.trendlogList.data);
      }
    });
    if (this.adhocUtility.checkedList.length > 0) {
      this.trendlogList.data.forEach(l => {
        if (l["checked"] == true) {
          if(this.searchUtility.model.objectType == 'Roomlist'){
            this._utility.selectedItems.push({ "sid": l["sid"],"site": l["site"], "room": l["room"],"roomID": l["roomID"],  "environment": l["environment"], "checked":  l["checked"],})
          }else if(this.searchUtility.model.objectType == 'Trendlog') {
          this._utility.selectedItems.push({"logDescription": l["logDescription"], "engineeringUnit": l["engineeringUnit"], "logDevNum": l["logDevNum"],"logInst": l["logInst"],"sid" : l["sid"],"checked":  l["checked"], "trendlogName": l["trendlogName"] });
          console.log(this._utility.selectedItems);
          }
        }
      });
    }
    this.adhocUtility.checkedList = this._utility.selectedItems;
  }


  swapPositions = (array, a, b) => {
    [array[a], array[b]] = [array[b], array[a]]
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


        }

        if (this.model.objectType != undefined) {
          this.model.objectType = this.searchUtility.model.objectType
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
          if (this.model.app == 'lookUpApp') {
            if (this.model.classType == undefined || this.model.classType == '') {
              this.model.objectType = this.searchUtility.model.objectType
              this.getSearchResultsLookUp(this._selectionObjInput);
            }
            else {
              this.model.objectType = this.searchUtility.model.objectType
              this.getSearchResultsLookUpByClassType(this._selectionObjInput);
            }
          }
          else {
            this.model.objectType = this.searchUtility.model.objectType
            this.getSearchResults(this._selectionObjInput);
          }

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
    this.currentPageSize = pageEvent.pageSize;
    this.startingIndex = pageEvent.pageIndex * pageEvent.pageSize,
      this.endingIndex = this.startingIndex + (pageEvent.pageSize < (pageEvent.length - this.startingIndex) ? pageEvent.pageSize : (pageEvent.length - this.startingIndex));
    this.isDisable = false;
    if (this.model.DevNum == null) {
      pageEvent.previousPageIndex = pageEvent.pageIndex;
      setTimeout(() => { this.trendlogList.paginator.length = this.dataLength; });
      if (((this.endingIndex + this.currentPageSize) > this.length && this.length != this.dataLength) && pageEvent.pageIndex != 0) {
        this.isDisable = true;
        this.model.pageNumber = Math.round(this.dataLength / this.length);
        this.search
          .getTrendLogList(this.model)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(data => {

            // setTimeout(() => {
            this.trendlogList = new MatTableDataSource(data.table);
            this.trendlogList.data = data.table.concat(this.trendlogData);
            this.trendlogData = this.trendlogList.data;

            setTimeout(() => {
              this.trendlogList.paginator.pageIndex = pageEvent.pageIndex;
              this.trendlogList.paginator.length = this.dataLength;
            });
            this.trendlogList.data.forEach(s => (s["checked"] = false));
            //    this.getData({ pageIndex: this.page, pageSize: this.size});
            // });

            if (this.model.app == 'app') {
              // this.filter = '';
              // this.adhocUtility.saveFilter = '';
              if (this._utility.selectedItems.length > 0) {
                var temp = new Array();
                this._utility.selectedItems.forEach(s => {
                  if (typeof s == "string" || typeof s == "number") {
                    this.trendlogList.data.forEach(l => {
                      if (s == l["sid"]) {
                        if(this.searchUtility.model.objectType == 'Roomlist'){
                          temp.push({ "sid": l["sid"],"site": l["site"], "room": l["room"],"roomID": l["roomID"],  "environment": l["environment"], "checked":  true})
                        }else if(this.searchUtility.model.objectType == 'Trendlog') {
                        temp.push({ "sid": Number(s), "trendlogName": l["trendlogName"], "logInst": l["logInst"], "logDevNum": l["logDevNum"], "logDescription": l["logDescription"], "engineeringUnit": l["engineeringUnit"], "checked": true });
                      }
                    }
                    });
                  }
                  else {
                    this.trendlogList.data.forEach(l => {
                      if (s.sid == l['sid']) {
                        if(this.searchUtility.model.objectType == 'Roomlist'){
                          temp.push({ "sid": l["sid"],"site": l["site"], "room": l["room"],"roomID": l["roomID"],  "environment": l["environment"], "checked":  true})
                        }else if(this.searchUtility.model.objectType == 'Trendlog') {
                        temp.push({ "sid": l["sid"], "trendlogName": l['trendlogName'], "logInst": l["logInst"], "logDevNum": l["logDevNum"], "logDescription": l["logDescription"], "engineeringUnit": l["engineeringUnit"], "checked": true });
                      }
                    }
                    });
                  }

                });

                // this.adhocUtility.checkedList = temp;
              }
            }
            // this.filter = this.adhocUtility.saveFilter;
            console.log(this._utility.selectedItems);
            if (this.adhocUtility.checkedList.length > 0) {
              this.adhocUtility.checkedList.forEach(s => {
                this.trendlogList.data.forEach(l => {
                  if (s.sid == l["sid"]) {
                    l["checked"] = true;
                    return;
                  }
                  else {
                    l["standardID"] = '';
                  }
                });
              });
            }
            if (this._utility.selectedItems) {
              if (this._utility.selectedItems.length > 0 || this.adhocUtility.checkedList.length > 0) {
                this.checked();
              }
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
    //this.length = 0;
    this.search
      .getTrendLogList(searchObjects)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {

        // setTimeout(() => {
        this.trendlogList = new MatTableDataSource(data.table);
        this.trendlogData = data.table;
        this.trendlogList.data.forEach(s => (s["checked"] = false));
        this.length = this.trendlogList.data.length;
        if (this.model.DevNum == null || this.model.DevNum == '') {
          this.dataLength = data.table1[0].totalCount;
          setTimeout(() => { this.trendlogList.paginator.length = this.dataLength; });
        }
        else {
          this.dataLength = this.trendlogList.data.length;
        }
        this.trendlogList.sort = this.trendlogSort;
        this.trendlogList.paginator = this.trendlogPaginator;
        this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size, length: this.length });
        // });

        if (
          (this.adhocUtility.adhocPreviousRoute == '/appAdhoc/search' || this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
          (this.adhocUtility.adhocPreviousRoute ==
            '/search/trendlog/alarmDetail?objectType=' +
            searchObjects.objectType +
            '&sid=' +
            this.adhocUtility.paramSid +
            '&isDetails=true&app=search' || this.adhocUtility.adhocPreviousRoute ==
            '/search/trendlog/trendlog?objectType=' +
            searchObjects.objectType +
            '&sid=' +
            this.adhocUtility.paramSid +
            '&isDetails=true&app=search' ||
            this.utility.adhocPreviousRoute == '/search/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.utility.adhocPreviousRoute == '/search/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=adhoc' ||
            this.adhocUtility.adhocPreviousRoute ==
            '/home/search/trendlog/deviceDetail?objectType=Device&DevNum=' +
            this.adhocUtility.paramDevNum +
            '&isDetails=true&app=' + this.model.app ||
            (this.router.url == "/searchobj/trendlog?objectType=Trendlog&app=search" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == "/search/trendlog?objectType=Trendlog&app=search" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == "/searchobj/trendlog?objectType=Trendlog&app=adhoc" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == "/search/trendlog?objectType=Trendlog&app=adhoc" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == '/searchobj/trendlog?objectType=Trendlog&DevNum=' + this.adhocUtility.paramDevNum + '&isDetails=true&app=search' && this.utility.adhocPreviousRoute == '/appAdhoc/search') || (this._utility.selectedItems != null && this.model.app == 'app'))
        ) {
          if (this.model.app == 'app') {
            // this.filter = '';
            // this.adhocUtility.saveFilter = '';
            if (this._utility.selectedItems.length > 0) {
              var temp = new Array();
              this._utility.selectedItems.forEach(s => {
                if (typeof s == "string" || typeof s == "number") {
                  this.trendlogList.data.forEach(l => {
                    if (s == l["sid"]) {
                      if(this.searchUtility.model.objectType == 'Roomlist'){
                        temp.push({ "sid": Number(s),"site": l["site"], "room": l["room"],"roomID": l["roomID"],  "environment": l["environment"], "checked": true})
                      }else if(this.searchUtility.model.objectType == 'Trendlog') {
                        temp.push({ "sid": Number(s), "trendlogName": l["trendlogName"], "logInst": l["logInst"], "logDevNum": l["logDevNum"], "logDescription": l["logDescription"], "engineeringUnit": l["engineeringUnit"], "checked": true });
                      }


                    }
                  });
                }
                else {
                  this.trendlogList.data.forEach(l => {
                    if (s.sid == l['sid']) {
                      if(this.searchUtility.model.objectType == 'Roomlist'){
                        temp.push({ "sid": l["sid"],"site": l["site"], "room": l["room"],"roomID": l["roomID"],  "environment": l["environment"], "checked":  true})
                      }else if(this.searchUtility.model.objectType == 'Trendlog') {
                      temp.push({ "sid": l["sid"], "trendlogName": l['trendlogName'], "logInst": l["logInst"], "logDevNum": l["logDevNum"], "logDescription": l["logDescription"], "engineeringUnit": l["engineeringUnit"], "checked": true });
                    }
                  }
                  });
                }

              });

              this.adhocUtility.checkedList = temp;
            }
            this.adhocUtility.saveFilter = this.model.keyWord;
          }
          this.filter = this.adhocUtility.saveFilter;
          console.log(this._utility.selectedItems);
          if (this.adhocUtility.checkedList.length > 0) {
            this.adhocUtility.checkedList.forEach(s => {
              this.trendlogList.data.forEach(l => {
                if (s.sid == l["sid"]) {
                  l["checked"] = true;
                  return;
                }
                else {
                  l["standardID"] = '';
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
    //this.length = 0;
    this.search
      .getTrendLogList(searchObjects)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {

        // setTimeout(() => {
        this.trendlogList = new MatTableDataSource(data.table);
        this.trendlogData = data.table;
        this.length = this.trendlogList.data.length;
        if (this.model.DevNum == null || this.model.DevNum == '') {
          this.dataLength = data.table1[0].totalCount;
          setTimeout(() => { this.trendlogList.paginator.length = this.dataLength; });
        }

        this.trendlogList.sort = this.trendlogSort;
        this.trendlogList.paginator = this.trendlogPaginator;
        this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size, length: this.length });
        // });

        if (
          (this.adhocUtility.adhocPreviousRoute == '/appAdhoc/search' || this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
          (this.adhocUtility.adhocPreviousRoute ==
            '/search/trendlog/alarmDetail?objectType=' +
            searchObjects.objectType +
            '&sid=' +
            this.adhocUtility.paramSid +
            '&isDetails=true&app=search' || this.adhocUtility.adhocPreviousRoute ==
            '/search/trendlog/trendlog?objectType=' +
            searchObjects.objectType +
            '&sid=' +
            this.adhocUtility.paramSid +
            '&isDetails=true&app=search' ||
            this.utility.adhocPreviousRoute == '/search/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.utility.adhocPreviousRoute == '/search/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=adhoc' ||
            this.adhocUtility.adhocPreviousRoute ==
            '/home/search/trendlog/deviceDetail?objectType=Device&DevNum=' +
            this.adhocUtility.paramDevNum +
            '&isDetails=true&app=' + this.model.app ||
            (this.router.url == "/searchobj/trendlog?objectType=Trendlog&app=search" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == "/search/trendlog?objectType=Trendlog&app=search" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == "/searchobj/trendlog?objectType=Trendlog&app=adhoc" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == "/search/trendlog?objectType=Trendlog&app=adhoc" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == '/searchobj/trendlog?objectType=Trendlog&DevNum=' + this.adhocUtility.paramDevNum + '&isDetails=true&app=search' && this.utility.adhocPreviousRoute == '/appAdhoc/search') || (this._utility.selectedItems != null && this.model.app == 'app') ||
            this.router.url == "/searchobj/trendlog?objectType=Trendlog&app=search" ||
            this.router.url == "/search/trendlog?objectType=Trendlog&app=search" ||
            this.router.url == "/searchobj/trendlog?objectType=Trendlog&app=adhoc" ||
            this.router.url == "/search/trendlog?objectType=Trendlog&app=adhoc" ||
            this.router.url == '/searchobj/trendlog?objectType=Trendlog&keyword=' + this.adhocUtility.keyWord + '&app=adhoc' ||
            this.router.url == '/search/trendlog?objectType=Trendlog&keyword=' + this.adhocUtility.keyWord + '&app=search' ||
            this.router.url == '/searchobj/trendlog?objectType=Trendlog&keyword=' + this.adhocUtility.keyWord + '&app=search' ||
            this.router.url == '/search/trendlog?objectType=Trendlog&keyword=' + this.adhocUtility.keyWord + '&app=adhoc'
          )
        ) {
          if (this.model.app == 'app') {
            // this.filter = '';
            // this.adhocUtility.saveFilter = '';
            if (this._utility.selectedItems.length > 0) {
              var temp = new Array();
              this._utility.selectedItems.forEach(s => {
                if (typeof s == "string" || typeof s == "number") {
                  this.trendlogList.data.forEach(l => {
                    if (s == l["sid"]) {
                      if(this.searchUtility.model.objectType == 'Roomlist'){
                        temp.push({ "sid": l["sid"],"site": l["site"], "room": l["room"],"roomID": l["roomID"],  "environment": l["environment"], "checked":  true})
                      }else if(this.searchUtility.model.objectType == 'Trendlog') {
                      temp.push({ "sid": Number(s), "trendlogName": l["trendlogName"], "logInst": l["logInst"], "logDevNum": l["logDevNum"], "logDescription": l["logDescription"], "engineeringUnit": l["engineeringUnit"], "checked": true });
                    }
                  }
                  });
                }
                else {
                  this.trendlogList.data.forEach(l => {
                    if (s.sid == l['sid']) {
                      temp.push({ "sid": l["sid"], "trendlogName": l['trendlogName'], "logInst": l["logInst"], "logDevNum": l["logDevNum"], "logDescription": l["logDescription"], "engineeringUnit": l["engineeringUnit"], "checked": true });
                    }
                  });
                }

              });

              this.adhocUtility.checkedList = temp;
            }
          }
          this.filter = this.adhocUtility.saveFilter;
          console.log(this._utility.selectedItems);
          if (this.adhocUtility.checkedList.length > 0) {
            this.adhocUtility.checkedList.forEach(s => {
              this.trendlogList.data.forEach(l => {
                if (s.sid == l["sid"]) {
                  l["checked"] = true;
                  return;
                }
                else {
                  l["standardID"] = '';
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
  getSearchResultsLookUp(lookUpObject) {
    this.showSpinner = true;
    this._utility.standard = [];
    this.length = 0;
    this.search
      .getTrendLogListLookUp(lookUpObject)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        //this._utility.standard = data.table1
        // setTimeout(() => {
        this.trendlogList = new MatTableDataSource(data.table);
        this.trendlogData = data.table;
        this.length = this.trendlogList.data.length;
        this.trendlogList.data.forEach(s => (s["checked"] = false));
        if (this.model.DevNum == null || this.model.DevNum == '') {
          if (data.table.length > 0) {
            this.dataLength = data.table1[0].totalCount;
            setTimeout(() => { this.trendlogList.paginator.length = this.dataLength; });
          }
        }
        this.trendlogList.sort = this.trendlogSort;
        this.trendlogList.paginator = this.trendlogPaginator;
        this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size, length: this.length });

        // });

        if (
          (this.adhocUtility.adhocPreviousRoute == '/appAdhoc/search' || this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
          (this.adhocUtility.adhocPreviousRoute ==
            '/search/trendlog/alarmDetail?objectType=' +
            lookUpObject.objectType +
            '&sid=' +
            this.adhocUtility.paramSid +
            '&isDetails=true&app=search' || this.adhocUtility.adhocPreviousRoute ==
            '/search/trendlog/trendlog?objectType=' +
            lookUpObject.objectType +
            '&sid=' +
            this.adhocUtility.paramSid +
            '&isDetails=true&app=search' ||
            this.utility.adhocPreviousRoute == '/search/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.utility.adhocPreviousRoute == '/search/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=adhoc' ||
            this.adhocUtility.adhocPreviousRoute ==
            '/home/search/trendlog/deviceDetail?objectType=Device&DevNum=' +
            this.adhocUtility.paramDevNum +
            '&isDetails=true&app=' + this.model.app ||
            (this.router.url == "/searchobj/trendlog?objectType=Alarm&app=search" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == "/search/trendlog?objectType=Alarm&app=search" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == "/searchobj/trendlog?objectType=Alarm&app=adhoc" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == "/search/trendlog?objectType=Alarm&app=adhoc" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == '/searchobj/trendlog?objectType=Trendlog&DevNum=' + this.adhocUtility.paramDevNum + '&isDetails=true&app=search' && this.utility.adhocPreviousRoute == '/appAdhoc/search') || (this._utility.selectedItems != null && this.model.app == 'app' || this.model.app == 'lookUpApp'))
        ) {
          if (this.model.app == 'lookUpApp') {
            if (this.lookUpConfig.selectedStandardsItems.length != 0) {
              var temp = new Array();
              var temp2 = new Array();
              this.trendlogList.data.forEach(l => {
                if(this.searchUtility.model.objectType == 'Roomlist'){
                temp.push({ "sid": l["sid"],"site": l["site"], "room": l["room"],"roomID": l["roomID"],  "environment": l["environment"], "checked":  true})
              }else if(this.searchUtility.model.objectType == 'Trendlog') {
                if (l['location'] == this.model.location) {
                  temp.push({ "sid": l["sid"], "trendlogName": l['trendlogName'], "logInst": l["logInst"], "logDevNum": l["logDevNum"], "logDescription": l["logDescription"], "engineeringUnit": l["engineeringUnit"], "PointSID": l["sid"], "standardID": l["standardID"], "standard": l["standard"], "checked": true });
                  temp2.push({ PointSID: l["sid"], StandardSID: l["standardID"] });
                }
              }
              });

              this.adhocUtility.checkedList = temp;
              this.lookUpConfig.selectedSIDsItems = temp2;
            }
          }
          this.filter = this.adhocUtility.saveFilter;
          console.log(this._utility.selectedItems);
          if (this.adhocUtility.checkedList.length > 0) {
            this.adhocUtility.checkedList.forEach(s => {
              this.trendlogList.data.forEach(l => {
                if (s.sid == l["sid"]) {
                  l["checked"] = true;
                  return;
                }
                else {
                  l["standardID"] = '';
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
  getSearchResultsLookUpByClassType(lookUpObject) {
    this.showSpinner = true;
    this._utility.standard = [];
    this.length = 0;
    this.search
      .getTrendLogListLookUp(lookUpObject)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        this._utility.standard = data.table2
        const uniqueData = data.table.filter((item, index, self) =>
          index === self.findIndex(t => t.sid === item.sid)
        );

        // Assign the unique data to data.table
        data.table = uniqueData;

        // Assign data.table to trendlogData
        this.trendlogData = data.table;

        // Assign data.table to trendlogList
        this.trendlogList = new MatTableDataSource(data.table);

        this.length = this.trendlogList.data.length;
        if (this.model.DevNum == null || this.model.DevNum == '') {
          this.dataLength = data.table1[0].totalCount;
          setTimeout(() => { this.trendlogList.paginator.length = this.dataLength; });
        }
        this.trendlogList.sort = this.trendlogSort;
        this.trendlogList.paginator = this.trendlogPaginator;
        this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size, length: this.length });
        // });

        if (
          (this.adhocUtility.adhocPreviousRoute == '/appAdhoc/search' || this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
          (this.adhocUtility.adhocPreviousRoute ==
            '/search/trendlog/alarmDetail?objectType=' +
            lookUpObject.objectType +
            '&sid=' +
            this.adhocUtility.paramSid +
            '&isDetails=true&app=search' || this.adhocUtility.adhocPreviousRoute ==
            '/search/trendlog/trendlog?objectType=' +
            lookUpObject.objectType +
            '&sid=' +
            this.adhocUtility.paramSid +
            '&isDetails=true&app=search' ||
            this.utility.adhocPreviousRoute == '/search/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.utility.adhocPreviousRoute == '/search/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=adhoc' ||
            this.adhocUtility.adhocPreviousRoute ==
            '/home/search/trendlog/deviceDetail?objectType=Device&DevNum=' +
            this.adhocUtility.paramDevNum +
            '&isDetails=true&app=' + this.model.app ||
            (this.router.url == "/searchobj/trendlog?objectType=Alarm&app=search" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == "/search/trendlog?objectType=Alarm&app=search" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == "/searchobj/trendlog?objectType=Alarm&app=adhoc" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == "/search/trendlog?objectType=Alarm&app=adhoc" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == '/searchobj/trendlog?objectType=Trendlog&DevNum=' + this.adhocUtility.paramDevNum + '&isDetails=true&app=search' && this.utility.adhocPreviousRoute == '/appAdhoc/search') || (this._utility.selectedItems != null && this.model.app == 'app' || this.model.app == 'lookUpApp'))
        ) {
          if (this.model.app == 'lookUpApp') {
            if (this.lookUpConfig.selectedStandardsItems != 0) {
              var temp = new Array();
              var temp2 = new Array();
              this.trendlogList.data.forEach(l => {
                if(this.searchUtility.model.objectType == 'Roomlist'){
                  temp.push({ "sid": l["sid"],"site": l["site"], "room": l["room"],"roomID": l["roomID"],  "environment": l["environment"], "checked":  true})
                }else if(this.searchUtility.model.objectType == 'Trendlog') {
                if (l['location'] != null && l['location'] != '' && l['roomName'] != null && l['roomName'] != '') {
                  if (l['location'].toLowerCase == this.model.location.toLowerCase && l['roomName'].toLowerCase == this.model.roomName.toLowerCase) {
                    temp.push({ "sid": l["sid"], "trendlogName": l['trendlogName'], "logInst": l["logInst"], "logDevNum": l["logDevNum"], "logDescription": l["logDescription"], "engineeringUnit": l["engineeringUnit"], "PointSID": l["sid"], "standardID": l["standardID"], "standard": l["standard"], "checked": true });
                    temp2.push({ PointSID: l["sid"], StandardSID: l["standardID"] });
                  }
                }
              }
              });

              this.adhocUtility.checkedList = temp;
              this.lookUpConfig.selectedSIDsItems = temp2;
            }
          }
          this.filter = this.adhocUtility.saveFilter;
          console.log(this._utility.selectedItems);
          if (this.adhocUtility.checkedList.length > 0) {
            this.adhocUtility.checkedList.forEach(s => {
              this.trendlogList.data.forEach(l => {
                if (s.sid == l["sid"]) {
                  l["checked"] = true;
                  return;
                }
                else {
                  l["standardID"] = '';
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
  getSearchResultsLookUpByfilter(lookUpObject) {
    this.showSpinner = true;
    this._utility.standard = [];
    this.length = 0;
    this.search
      .getTrendLogListLookUp(lookUpObject)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        this._utility.standard = data.table2
        // setTimeout(() => {
        const uniqueData = data.table.filter((item, index, self) =>
          index === self.findIndex(t => t.sid === item.sid)
        );

        // Assign the unique data to data.table
        data.table = uniqueData;

        // Assign data.table to trendlogData
        this.trendlogData = data.table;

        // Assign data.table to trendlogList
        this.trendlogList = new MatTableDataSource(data.table);
        this.length = this.trendlogList.data.length;
        if (this.model.DevNum == null || this.model.DevNum == '') {
          this.dataLength = data.table1[0].totalCount;
          setTimeout(() => { this.trendlogList.paginator.length = this.dataLength; });
        }

        this.trendlogList.sort = this.trendlogSort;
        this.trendlogList.paginator = this.trendlogPaginator;
        this.getData({ pageIndex: this.page, pageSize: localStorage.getItem('ItemPerPage') != null ? this.size = +localStorage.getItem('ItemPerPage') : this.size, length: this.length });
        // });

        if (
          (this.adhocUtility.adhocPreviousRoute == '/appAdhoc/search' || this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
          (this.adhocUtility.adhocPreviousRoute ==
            '/search/trendlog/alarmDetail?objectType=' +
            lookUpObject.objectType +
            '&sid=' +
            this.adhocUtility.paramSid +
            '&isDetails=true&app=search' || this.adhocUtility.adhocPreviousRoute ==
            '/search/trendlog/trendlog?objectType=' +
            lookUpObject.objectType +
            '&sid=' +
            this.adhocUtility.paramSid +
            '&isDetails=true&app=search' ||
            this.utility.adhocPreviousRoute == '/search/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=search' ||
            this.utility.adhocPreviousRoute == '/search/trendlog/trendDetail?objectType=Trendlog&sid=' + this.adhocUtility.paramSid + '&isDetails=true&app=adhoc' ||
            this.adhocUtility.adhocPreviousRoute ==
            '/home/search/trendlog/deviceDetail?objectType=Device&DevNum=' +
            this.adhocUtility.paramDevNum +
            '&isDetails=true&app=' + this.model.app ||
            (this.router.url == "/searchobj/trendlog?objectType=Alarm&app=search" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == "/search/trendlog?objectType=Alarm&app=search" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == "/searchobj/trendlog?objectType=Alarm&app=adhoc" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == "/search/trendlog?objectType=Alarm&app=adhoc" && this.utility.adhocPreviousRoute == '/appAdhoc/search') ||
            (this.router.url == '/searchobj/trendlog?objectType=Trendlog&DevNum=' + this.adhocUtility.paramDevNum + '&isDetails=true&app=search' && this.utility.adhocPreviousRoute == '/appAdhoc/search') || (this._utility.selectedItems != null && this.model.app == 'app' || this.model.app == 'lookUpApp'))
        ) {
          if (this.model.app == 'lookUpApp') {
            if (this.lookUpConfig.selectedStandardsItems != 0) {
              var temp = new Array();
              var temp2 = new Array();
              this.trendlogList.data.forEach(l => {
                if(this.searchUtility.model.objectType == 'Roomlist'){
                  temp.push({ "sid": l["sid"],"site": l["site"], "room": l["room"],"roomID": l["roomID"],  "environment": l["environment"], "checked":  true})
                }else if(this.searchUtility.model.objectType == 'Trendlog') {
                if (l['location'] == this.model.location && l['roomName'] == this.model.roomName) {
                  temp.push({ "sid": l["sid"], "trendlogName": l['trendlogName'], "logInst": l["logInst"], "logDevNum": l["logDevNum"], "logDescription": l["logDescription"], "engineeringUnit": l["engineeringUnit"], "PointSID": l["sid"], "standardID": l["standardID"], "standard": l["standard"], "checked": true });
                  temp2.push({ PointSID: l["sid"], StandardSID: l["standardID"] });
                }
              }
              });

              //  this.adhocUtility.checkedList = temp;
              //  this.lookUpConfig.selectedSIDsItems = temp2;
            }
          }
          this.filter = this.adhocUtility.saveFilter;
          console.log(this._utility.selectedItems);
          if (this.adhocUtility.checkedList.length > 0) {
            this.adhocUtility.checkedList.forEach(s => {
              this.trendlogList.data.forEach(l => {
                if (s.sid == l["sid"]) {
                  l["checked"] = true;
                  return;
                }
                else {
                  l["standardID"] = '';

                }
              });
            });
          } else {
            this.trendlogList.data.forEach(l => {
              l["standardID"] = '';
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
  getStandards() {
    if (this.standards == undefined || this.standards.length == 0) {
      this.search
        .getTrendLogListLookUp(this._selectionObjInput)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(data => {
          this.standards = data.table1;
        });
    }

    //this._lookUpConfig.selectedLocationsItems
  }
  checked() {
    this.key = '';
    this.reverse = false;
    this.tempAray = [];
    this.tempAray = this.trendlogList.data;
    if (this.adhocUtility.checkedList.length > 0) {
      this.adhocUtility.checkedList.forEach(s => {
        this.tempAray.forEach((l, i) => {
          if (s.sid == l.sid) {
            this.trendlogList.data.splice(i, 1);
            return;
          }
        });
      });
      if (this.adhocUtility.checkedList.length > 0) {
        // this.standardCount=0;
        for (var i = 0; i < this.adhocUtility.checkedList.length; i++) {
          if (this.adhocUtility.checkedList[i].standardID == null || this.adhocUtility.checkedList[i].standardID == '' || this.adhocUtility.checkedList[i].standardID == 'none') {
            //   this.standardCount++;
            this._utility.saveDisable = true;
            break;
          }
          else {
            //  this.standardCount = 0;
            this._utility.saveDisable = false;
          }
        }
      } else {
        this._utility.saveDisable = true;
      }
    }
    // if(this.lookUpConfig.selectedSIDsItems){
    //   this.adhocUtility.checkedList.forEach(data => {
    //     if(this.adhocUtility.checkedList["sid"] == this.lookUpConfig.selectedSIDsItems["PointSID"])
    //     this.adhocUtility.checkedList["standardID"] = this.lookUpConfig.selectedSIDsItems["standardID"]
    //   })
    // }


    const tempArray1 = [...this.adhocUtility.checkedList, ...this.trendlogList.data];
    this.trendlogList.data = tempArray1.map((item: any) => ({ ...item }));

    this.sortProperty = 'checked';
    this.sortDirection = 'desc';
    if (this.trendlogList.sort) {
      this.trendlogList.sort.active = this.trendlogList.sort.active != "checked" ? "checked" : "checked";
      this.trendlogList.sort.direction = "desc";
    }

    if (this.trendlogList.paginator) {
      this.trendlogList.paginator.firstPage();
      setTimeout(() => { this.trendlogList.paginator.length = this.dataLength; });
    }

    //this.onChange(newValue,obj)
  }
  findIndexToUpdate(obj) {
    return obj.sid === this;
  }
  ngAfterViewInit(): void {
    this.trendlogList.sort = this.trendlogSort;
    this.trendlogList.paginator = this.trendlogPaginator;
    this.cdr.detectChanges();
  }
  applyFilter(filterValue: string, event) {
    const tempsid = [];
    //filterValue = filterValue.trim(); // Remove whitespace
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
      this._utility.isUpdate = true
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
    // temp = temp.toLowerCase(); // MatTabletrendlogList defaults to lowercase matches
    this.trendlogList.filter = temp;
    //this.filter = temp;
    this.adhocUtility.saveFilter = '';

    if (this.model.app == 'lookUpApp') {
      if (this.adhocUtility.checkedList) {
        this.adhocUtility.checkedList.forEach(element => {
          tempsid.push(element.sid);
        });
        this.model.sidParams = tempsid.toString();
      }
      this.model.objectType = this.searchUtility.model.objectType
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.app = 'lookUpApp';
      this.model.appId = this._utility.appID
      this.model.keyWord = temp == '' ? null : temp;
      this.model.classType = this.adhocUtility.classType;
      // this.model.regfiltertype = this.selectedLocation;
      this.model.pageNumber = 1;
      this.getSearchResultsLookUpByfilter(this.model);
    }
    else {
      this.model.objectType = this.searchUtility.model.objectType
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.app = this.model.app;
      this.model.appId = this._utility.appID
      this.model.keyWord = temp == '' ? null : temp;
      this.model.pageNumber = 1;
      this.getSearchResultsByFilter(this.model);
    }

  }

  filterByKey(filterValue: string, event) {
    const tempsid = [];
    if (event.keyCode === 20 || event.keyCode === 9) {
      return;
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
    temp = temp.toLowerCase(); // MatTabletrendlogList defaults to lowercase matches
    this.trendlogList.filter = temp;
    //this.filter = temp;
    this.adhocUtility.saveFilter = '';
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
    if (this.model.app == 'lookUpApp') {
      if (this.adhocUtility.checkedList) {
        this.adhocUtility.checkedList.forEach(element => {
          tempsid.push(element.sid);
        });
        this.model.sidParams = tempsid.toString();
      }
      if ((this.trendlogList.filteredData.length > 0 || this.trendlogList.filteredData.length == 0) && temp == '' && event.keyCode === 8) {
        this.model.objectType = this.searchUtility.model.objectType
        this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
        this.model.userId = this.tenantService.currentTenantValue.userId;
        this.model.app = 'lookUpApp';
        this.model.appId = this._utility.appID
        this.model.pageNumber = 1;
        this.model.keyWord = temp == '' ? null : temp;
        this.model.classType = this.adhocUtility.classType;
        // this.model.regfiltertype = this.selectedLocation;

        this.getSearchResultsLookUpByfilter(this.model);
      }
    }
    else {
      if ((this.trendlogList.filteredData.length > 0 || this.trendlogList.filteredData.length == 0) && temp == '' && event.keyCode === 8) {
        this.model.objectType = this.searchUtility.model.objectType
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
        this.model.objectType = this.searchUtility.model.objectType
        this.model.keyWord = temp == '' ? null : temp;
        this.getSearchResultsByFilter(this.model);
      }
    }
  }

  applyFilter1(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.trendlogList.filter = filterValue;
  }
  findIndexToUpdate1(obj) {
    return obj.logDescription + obj.trendlogName === this;
  }
  findIndexToUpdate2(obj) {
    return obj.descr + obj.objName === this;
  }

  onChange(newValue, obj) {

    console.log(newValue);
    obj.standardID = newValue.source.value;

    if (this.adhocUtility.checkedList.length > 0) {
      this.adhocUtility.checkedList.forEach(data => {
        if (obj.sid == data.sid) {
          this.adhocUtility.checkedList.standardID = +newValue.source.value;
        }
      })
    }
    // this.trendlogList.data.forEach(data => {
    //     if(obj.sid == data["sid"]){
    //       data["standardID"] = newValue.target.value;
    //       console.log(data);
    //       this.trendlogList.data["standardID"] = newValue.target.value;
    //     }
    // });
    this.adhocUtility.checkedList.forEach(element => {
      if (element.sid == obj.sid) {
        element.standardID = newValue.source == undefined ? 0 : newValue.source.value
        return;
      }
    });
    if (this.adhocUtility.checkedList.length > 0) {
      for (var i = 0; i < this.adhocUtility.checkedList.length; i++) {
        if (this.adhocUtility.checkedList[i].standardID == null || this.adhocUtility.checkedList[i].standardID == "none" || this.adhocUtility.checkedList[i].standardID == '') {
          this.standardCount++;
          this._utility.saveDisable = true;
          break;
        }
        else {
          this.standardCount = 0;
          this._utility.saveDisable = false;
        }
      }
    } else {
      this._utility.saveDisable = true;
    }
    if (this.lookUpConfig.selectedSIDsItems.length == 0) {
      this.tempObj = {
        PointSID: obj.sid,
        StandardSID: newValue.source == undefined ? 0 : newValue.source.value
      }
      this.lookUpConfig.selectedStandardsItems.push(this.tempObj);
    } else {
      this.lookUpConfig.selectedSIDsItems.forEach(element => {
        if (element.PointSID == obj.sid) {
          element.StandardSID = newValue.source == undefined ? 0 : newValue.source.value
          return;
        }
      });
    }
  }
  // Method to Clear Checkbox
  checkedState(obj, evt) {

    if (this.model.app == 'lookUpApp') {
      // if(this._utility.licenseInfo.isLimitedEdition)
      // {
      //     if(this._utility.reportID == "")
      //     {
      //       this.dummyreportID = -1;
      //     }
      //     else
      //     {
      //       this.dummyreportID = this._utility.reportID;
      //     }

      //     this._rptService.getReportObjectExistsByRooms(this.dummyreportID, obj.sid, this._utility.tenantID, this._utility.appID, obj.checked)
      //     .subscribe(response => {
      //       if (response) {
      //         if (!this.lookUpConfig.madateValidate) {
      //           const updateItem = this.adhocUtility.checkedList.find(this.findIndexToUpdate, obj.sid);
      //           if (this.model.objectType == 'Trendlog') {
      //             const updateObjName = this.adhocUtility.checkNames.find(this.findIndexToUpdate1, obj.logDescription + obj.trendlogName);
      //             this.index1 = this.adhocUtility.checkNames.indexOf(updateObjName);
      //           } else {
      //             const updateObjName = this.adhocUtility.checkNames.find(this.findIndexToUpdate2, obj.descr + obj.objName);
      //             this.index1 = this.adhocUtility.checkNames.indexOf(updateObjName);
      //           }

      //           let index = this.adhocUtility.checkedList.indexOf(updateItem);

      //           // console.log(index);

      //           if (index > -1) {
      //             this.adhocUtility.checkedList.splice(index, 1);
      //           } else {
      //             this.adhocUtility.checkedList.push(obj);
      //             //this._utility.validTemplateForm = true;
      //           }

      //           if (this.index1 > -1) {
      //             this.adhocUtility.checkNames.splice(this.index1, 1);
      //           } else {
      //             this.adhocUtility.checkNames.push(obj);
      //           }
      //           this._utility.selectedItems = this.adhocUtility.checkedList;
      //           //this.lookUpConfig.selectedSIDsItems = this.adhocUtility.checkedList;
      //           if (obj.checked == true) {
      //             this.tempObj = {
      //               PointSID: obj.sid,
      //               StandardSID: obj.standardID == undefined || obj.standardID == null ? 0 : obj.standardID
      //             }
      //             this.lookUpConfig.selectedSIDsItems.push(this.tempObj);
      //           }
      //           // if(this._utility.selectedItems.length < 0){
      //           //   this._utility.validTemplateForm = false;
      //           // }
      //           // else {
      //           //   this._utility.validTemplateForm = true;
      //           // }
      //           if (this.adhocUtility.checkedList.length > 0) {
      //             for (var i = 0; i < this.adhocUtility.checkedList.length; i++) {
      //               if ((this.adhocUtility.checkedList[i].standardID == null) || (this.adhocUtility.checkedList[i].standardID == "none" || this.adhocUtility.checkedList[i].standardID == '')) {
      //                 this.standardCount++;
      //                 this._utility.saveDisable = true;
      //                 break;
      //               }
      //               else {
      //                 this.standardCount = 0;
      //                 this._utility.saveDisable = false;
      //               }
      //             }
      //           } else {
      //             this._utility.saveDisable = true;
      //           }
      //           if (this.adhocUtility.checkedList)
      //             if (this.model.app == 'lookUpApp') {
      //               let found = -1;
      //               if (obj.checked == false) {
      //                 this.lookUpConfig.selectedSIDsItems.forEach(element => {
      //                   if (element.PointSID == obj.sid) {
      //                     found = this.lookUpConfig.selectedSIDsItems.indexOf(element);
      //                     return;
      //                   }
      //                 });
      //                 this.lookUpConfig.selectedSIDsItems.splice(found, 1);
      //                 obj.standardID = 'none';

      //               }
      //             }
      //         }
      //         else {
      //           obj.checked = false;
      //           evt.source.checked = false;
      //           let msgTitle = "Info";
      //           let msgBody = "Provide All mandatory fields first";
      //           this._utility.warningCommonDialog(msgBody, msgTitle);
      //         }

      //       }
      //       else
      //       {
      //         obj.checked = false;
      //         const dialogRef = this.dialog.open(DeleteDialog, {
      //           width: "390px",
      //           data: {
      //             id: 0,
      //             type: '',
      //             message: 'Reached the Object limit in this Edition.<br/>  Please contact LogicMatter at <b>support@logicmatter.com</b>',
      //             action: "Warning",
      //             title: "Info"
      //           }
      //         });
      //         return;

      //       }
      //     }, error => {
      //       console.error('Error:', error);
      //     });

      // }
      // else
      // {
        if (!this.lookUpConfig.madateValidate) {
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
            //this._utility.validTemplateForm = true;
          }

          if (this.index1 > -1) {
            this.adhocUtility.checkNames.splice(this.index1, 1);
          } else {
            this.adhocUtility.checkNames.push(obj);
          }
          this._utility.selectedItems = this.adhocUtility.checkedList;
          //this.lookUpConfig.selectedSIDsItems = this.adhocUtility.checkedList;
          if (obj.checked == true) {
            this.tempObj = {
              PointSID: obj.sid,
              StandardSID: obj.standardID == undefined || obj.standardID == null ? 0 : obj.standardID
            }
            this.lookUpConfig.selectedSIDsItems.push(this.tempObj);
          }
          // if(this._utility.selectedItems.length < 0){
          //   this._utility.validTemplateForm = false;
          // }
          // else {
          //   this._utility.validTemplateForm = true;
          // }
          if (this.adhocUtility.checkedList.length > 0) {
            for (var i = 0; i < this.adhocUtility.checkedList.length; i++) {
              if ((this.adhocUtility.checkedList[i].standardID == null) || (this.adhocUtility.checkedList[i].standardID == "none" || this.adhocUtility.checkedList[i].standardID == '')) {
                this.standardCount++;
                this._utility.saveDisable = true;
                break;
              }
              else {
                this.standardCount = 0;
                this._utility.saveDisable = false;
              }
            }
          } else {
            this._utility.saveDisable = true;
          }
          if (this.adhocUtility.checkedList)
            if (this.model.app == 'lookUpApp') {
              let found = -1;
              if (obj.checked == false) {
                this.lookUpConfig.selectedSIDsItems.forEach(element => {
                  if (element.PointSID == obj.sid) {
                    found = this.lookUpConfig.selectedSIDsItems.indexOf(element);
                    return;
                  }
                });
                this.lookUpConfig.selectedSIDsItems.splice(found, 1);
                obj.standardID = 'none';

              }
            }
        }
        else {
          obj.checked = false;
          evt.source.checked = false;
          let msgTitle = "Info";
          let msgBody = "Provide All mandatory fields first";
          this._utility.warningCommonDialog(msgBody, msgTitle);
        }
      // }
    }
    else {

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
      // if (index > -1) {
      //   this.adhocUtility.checkedList.splice(index, 1);
      // } else {
      //   this.adhocUtility.checkedList.push(obj);
      //   //this._utility.validTemplateForm = true;
      // }
      // if (this.index1 > -1) {
      //   this.adhocUtility.checkNames.splice(this.index1, 1);
      // } else {
      //   this.adhocUtility.checkNames.push(obj);
      // }
      // this._utility.selectedItems = this.adhocUtility.checkedList;
      // if (obj.checked == true) {
      //   this.tempObj = {
      //     PointSID: obj.sid,
      //     StandardSID: obj.standardID == undefined || obj.standardID == null ? 0 : obj.standardID
      //   }
      //   this.lookUpConfig.selectedSIDsItems.push(this.tempObj);
      // }
      // if (this.adhocUtility.checkedList.length > 0) {
      //   for (var i = 0; i < this.adhocUtility.checkedList.length; i++) {
      //     if (this.adhocUtility.checkedList[i].standardID == null) {
      //       this.standardCount++;
      //       this._utility.saveDisable = true;
      //       break;
      //     }
      //     else {
      //       this.standardCount = 0;
      //       this._utility.saveDisable = false;
      //     }
      //   }
      // } else {
      //   this._utility.saveDisable = true;
      // }
      // if (this.adhocUtility.checkedList)
      //   if (this.model.app == 'lookUpApp') {
      //     let found = -1;
      //     if (obj.checked == false) {
      //       this.lookUpConfig.selectedSIDsItems.forEach(element => {
      //         if (element.PointSID == obj.sid) {
      //           found = this.lookUpConfig.selectedSIDsItems.indexOf(element);
      //           return;
      //         }
      //       });
      //       this.lookUpConfig.selectedSIDsItems.splice(found, 1);
      //       obj.standardID = 'none';

      //     }
      //   }


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
      if (index > -1) {
        this.adhocUtility.checkedList.splice(index, 1);
      } else {
        this.adhocUtility.checkedList.push(obj);
        //this._utility.validTemplateForm = true;
      }
      if (this.index1 > -1) {
        this.adhocUtility.checkNames.splice(this.index1, 1);
      } else {
        this.adhocUtility.checkNames.push(obj);
      }
      this._utility.selectedItems = this.adhocUtility.checkedList;
      if (obj.checked == true) {
        this.tempObj = {
          PointSID: obj.sid,
          StandardSID: obj.standardID == undefined || obj.standardID == null ? 0 : obj.standardID
        }
        this.lookUpConfig.selectedSIDsItems.push(this.tempObj);
      }
      if (this.adhocUtility.checkedList.length > 0) {
        for (var i = 0; i < this.adhocUtility.checkedList.length; i++) {
          if (this.adhocUtility.checkedList[i].standardID == null) {
            this.standardCount++;
            this._utility.saveDisable = true;
            break;
          }
          else {
            this.standardCount = 0;
            this._utility.saveDisable = false;
          }
        }
      } else {
        this._utility.saveDisable = true;
      }
      if (this.adhocUtility.checkedList)
        if (this.model.app == 'lookUpApp') {
          let found = -1;
          if (obj.checked == false) {
            this.lookUpConfig.selectedSIDsItems.forEach(element => {
              if (element.PointSID == obj.sid) {
                found = this.lookUpConfig.selectedSIDsItems.indexOf(element);
                return;
              }
            });
            this.lookUpConfig.selectedSIDsItems.splice(found, 1);
            obj.standardID = 'none';

          }
        }

      // }

    }

  }
  clearSelection() {
    this.trendlogList.data.filter(g => {
      g["checked"] = false;
      return true;
    });
    this.adhocUtility.checkedList.forEach(s => {
      this.trendlogList.data.forEach(l => {
        if (s["sid"] == l["sid"]) {
          l["standardID"] = '';
          return;
        }
      });
    });
    this.showPlot = false;
    this.adhocUtility.checkedList = [];
    this.adhocUtility.checkNames = [];
    this.lookUpConfig.selectedSIDsItems = [];
    this._utility.saveDisable = true;
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
  backParent() {
    this.location.back();
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
