import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchUtilityService } from '../search-utility.service';
import { UtilityService } from 'src/app/PmCore/services/utility.service';
import { takeUntil } from 'rxjs/operators';
import { TenantService, SearchServiceService } from 'src/app/PmCore/services';
import { Subject } from 'rxjs';
import { CommonModel } from 'src/app/PmModel/common.model';
import { Search } from 'src/app/PmModel/search.model';
import { AdhocReportutilityService } from 'projects/AppAdhoc/src/app/adhoc-reportutility.service';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
import { ToolbarComponent } from 'src/app/layout';
import { AppUtilService } from 'src/app/PmCore/shared/app-util.service';
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  ngUnsubscribe: Subject<void> = new Subject<void>();
  tenants: CommonModel;
  public model: Search = new Search();
  previousTenant: any = '';
  showSpinner: boolean;
  tempAray: any = [];
  tempAray1: any = [];
  routerValue: boolean = true;
  testUrl: string;
  currentRouter: string;
  previousUrl: string;
  regex = new RegExp('%20');
  fa: any[];
  fa2: any[];
  allObjects: any;
  count: any;
  missing: string[];
  searchCounts: any;
  reportList: any;
  key: string;
  reverse: boolean;
  filter;
  DevNum: any;
  checkedList: any;
  saveFilter: any;
  showPlot: boolean;
  p: number = 1;
  collectionSize: any;
  tests: any[];
  config: { currentPage: number; itemsPerPage: number };
  index1: any;
  selectedItems = {};
  disableTabs: boolean;
  isDetails: any;

  sort(key: string) {
    if (key !== '') {
      this.key = key;
      this.reverse = !this.reverse;
    }
  }
  constructor(
    public route: ActivatedRoute,
    private router: Router,
    public utility: UtilityService,
    public searchUtility: SearchUtilityService,
    public _utility: AppUtilService,
    public _Adhocutility: AdhocReportutilityService,
    private search: SearchServiceService,
    private coreService: CoreUtilityService,
    private tenantService: TenantService,
    public _toolbar: ToolbarComponent,) {
    this.config = {
      currentPage: 1,
      itemsPerPage: 10
    };
    this.selectItem(this.coreService.maxRecords, 1);
    this.isSelectedItem(this.coreService.maxRecords, 1);
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
  }
  selectItem(item, id) {
    this.config.itemsPerPage = item;
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
    this.utility.entitySelected = "Reports"
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.model.keyWord = params.keyword;
      this.model.objectType = params.objectType;
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.app = params.app;
      this.isDetails = params.isDetails;
      if (this._Adhocutility.keyWord) {
        this.model.keyWord = this._Adhocutility.keyWord;
      }
      this.model = this.model;
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

    // this.getSearchResults(this.model);
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
        console.log(this.model.tenantId);
        this.coreService.previousTenant = tenant.tenantName;
        if (this.tenantService.currentTenantValue.tenantName != this.coreService.previousTenant) {
          this.model.tenantId = tenant.tenantId;
          this.filter = '';
          this._Adhocutility.saveFilter = '';
          this._Adhocutility.checkedList = [];

          this.model.keyWord = '';
        }
        if (this.model.objectType != undefined) {
          this.getSearchResults(this.model);
        }
      }, err => {
        console.log(err);
      });
  }
  getSearchResults(searchObjects) {
    this.reportList = '';
    if (this.showSpinner === undefined) {
      this.showSpinner = true;
      this.disableTabs = false;
    } else {
      this.showSpinner = true;
      this.disableTabs = false;
    }

    this.search
      .getReportsList(searchObjects)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {

        this.reportList = data;
        //this.reportList.forEach(s => (s.selected = false));
        this.key = 'sid'; // set default
        this.reverse = true;
        this.sort(this.key);
        if (
          (this._Adhocutility.adhocPreviousRoute == '/appAdhoc/search') ||
          (this._Adhocutility.adhocPreviousRoute ==
            '/search/alarm/alarmDetail?objectType=' +
            searchObjects.objectType +
            '&sid=' +
            this._Adhocutility.paramSid +
            '&isDetails=true&app=search' || this._Adhocutility.adhocPreviousRoute ==
            '/search/trendlog/trendlog?objectType=' +
            searchObjects.objectType +
            '&sid=' +
            this._Adhocutility.paramSid +
            '&isDetails=true&app=search' ||
            this._Adhocutility.adhocPreviousRoute ==
            '/home/reportList/searchdetails?objectType=Device&DevNum=' +
            this._Adhocutility.paramDevNum +
            '&isDetails=true' || this._Adhocutility.adhocPreviousRoute ==
            '/home/search/alarm/deviceDetail?objectType=Device&DevNum=' +
            this._Adhocutility.paramDevNum +
            '&isDetails=true&app=' + this.model.app ||
            this._Adhocutility.adhocPreviousRoute == '/search/alarm?objectType=Alarm&DevNum=' +
            this._Adhocutility.paramDevNum + '&isDetails=true&app=' + this.model.app ||
            this._Adhocutility.adhocPreviousRoute == '/search/trendlog?objectType=Trendlog&DevNum=' +
            this._Adhocutility.paramDevNum + '&isDetails=true&app=' + this.model.app ||
            this._Adhocutility.adhocPreviousRoute == '/searchobj/trendlog/trendDetail?objectType=Trendlog&sid=' + this._Adhocutility.paramSid + '&isDetails=true&app=search' ||
            this._Adhocutility.adhocPreviousRoute == '/search/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' ||
            this._Adhocutility.adhocPreviousRoute == '/search/alarm/alarmDetail?objectType=Alarm&sid=' + this._Adhocutility.paramSid + '&isDetails=true&app=search' ||
            this._Adhocutility.adhocPreviousRoute == '/search/points/pointDetail?objectType=Points&sid=' + this._Adhocutility.paramSid + '&isDetails=true' ||
            this._Adhocutility.adhocPreviousRoute == '/searchobj/points/pointDetail?objectType=Points&sid=' + this._Adhocutility.paramSid + '&isDetails=true' ||
            this._Adhocutility.adhocPreviousRoute == '/searchobj/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' ||
            this._Adhocutility.adhocPreviousRoute == '/searchobj/alarm/alarmDetail?objectType=Alarm&sid=' + this._Adhocutility.paramSid + '&isDetails=true&app=search' ||
            this._Adhocutility.adhocPreviousRoute == '/search/trendlog/trendDetail?objectType=Trendlog&sid=' + this._Adhocutility.paramSid + '&isDetails=true&app=search' ||
            this._Adhocutility.adhocPreviousRoute == '/search/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' ||
            this._Adhocutility.adhocPreviousRoute == '/searchobj/trendlog/trendDetail?objectType=Trendlog&sid=' + this._Adhocutility.paramSid + '&isDetails=true&app=search' ||
            this._Adhocutility.adhocPreviousRoute == '/searchobj/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search')
        ) {
          this.filter = this._Adhocutility.saveFilter;
          if (this._Adhocutility.checkedList.length > 0) {
            this._Adhocutility.checkedList.forEach(s => {
              this.reportList.forEach(l => {
                if (s.sid == l.sid) {
                  l.selected = true;
                  return;
                }
              });
            });
          }
          // this.checked();
        } else {
          this.filter = '';
          this.showPlot = false;
          this._Adhocutility.checkedList = [];
          this._Adhocutility.checkNames = [];
        }
        this.count = this.reportList.length;
        this.p = 1;
        this.collectionSize = this.reportList.length;

        if (this.count >= '100') {
          this.tests = [
            {
              id: 1,
              items: ['10', '25', '50', '100']
            }
          ];
        } else if (this.count >= '50') {
          this.tests = [
            {
              id: 1,
              items: ['10', '25', '50', '100']
            }
          ];
        } else if (this.count >= '25') {
          this.tests = [
            {
              id: 1,
              items: ['10', '25', '50', '100']
            }
          ];
        } else if (this.count >= '10') {
          this.tests = [
            {
              id: 1,
              items: ['10', '25', '50', '100']
            }
          ];
        }
        this.showSpinner = false;
        this.disableTabs = true;
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
