import { Injectable } from '@angular/core';
import { TenantService, UserService, SearchServiceService } from 'src/app/PmCore/services';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModel } from 'src/app/PmModel/common.model';
import { Search } from 'src/app/PmModel/search.model';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilityService } from 'src/app/PmCore/services/utility.service';
import { AdhocReportutilityService } from 'projects/AppAdhoc/src/app/adhoc-reportutility.service';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';

@Injectable({
  providedIn: 'root'
})
export class SearchUtilityService {
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
  searchList: any;
  key: string;
  reverse: boolean;
  filter;
  DevNum:any;
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

  sort(key: string) {
    if (key !== '') {
      this.key = key;
      this.reverse = !this.reverse;
    }
  }
  private dataSource = new BehaviorSubject(this.model);
  currentMessage = this.dataSource.asObservable();
  constructor(
    public route: ActivatedRoute,
    private router: Router,
    private search: SearchServiceService,
    public utility: UtilityService,
    private tenantService: TenantService,
    public _Adhocutility: AdhocReportutilityService,
    private coreService: CoreUtilityService,
    private userService: UserService) { 
      this.config = {
        currentPage: 1,
        itemsPerPage: 10
      };
      this.selectItem(this.coreService.maxRecords, 1);
      this.isSelectedItem(this.coreService.maxRecords, 1);
      this.model.app ='search';
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
    changeSearchModel(objectsInfo: any) {
      this.dataSource.next(objectsInfo)
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
       
      }, err => {
        console.log(err);
      });
  }
  getSearchResults(searchObjects){
    
    if (this.showSpinner === undefined) {
      this.showSpinner = true;
      this.disableTabs = false;
    } else {
      this.showSpinner = true;
      this.disableTabs = false;
    }
    
    this.search
      .getSearchList(searchObjects)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        
        this.searchList = data;
        this.searchList.forEach(s => (s.selected = false));
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
            '/home/searchList/searchdetails?objectType=Device&DevNum=' +
            this._Adhocutility.paramDevNum +
            '&isDetails=true' || this._Adhocutility.adhocPreviousRoute == 
            '/home/search/alarm/deviceDetail?objectType=Device&DevNum=' +
            this._Adhocutility.paramDevNum +
            '&isDetails=true&app='+this.model.app ||
            this._Adhocutility.adhocPreviousRoute == '/search/alarm?objectType=Alarm&DevNum=' +
            this._Adhocutility.paramDevNum +'&isDetails=true&app='+this.model.app ||
            this._Adhocutility.adhocPreviousRoute ==  '/search/trendlog?objectType=Trendlog&DevNum=' +
            this._Adhocutility.paramDevNum +'&isDetails=true&app='+this.model.app ||
            this._Adhocutility.adhocPreviousRoute ==  '/searchobj/trendlog/trendDetail?objectType=Trendlog&sid='+this._Adhocutility.paramSid+'&isDetails=true&app=search' || 
            this._Adhocutility.adhocPreviousRoute == '/search/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' || 
            this._Adhocutility.adhocPreviousRoute == '/search/alarm/alarmDetail?objectType=Alarm&sid='+this._Adhocutility.paramSid+'&isDetails=true&app=search' || 
            this._Adhocutility.adhocPreviousRoute == '/search/points/pointDetail?objectType=Points&sid='+this._Adhocutility.paramSid+'&isDetails=true' ||
            this._Adhocutility.adhocPreviousRoute == '/searchobj/points/pointDetail?objectType=Points&sid='+this._Adhocutility.paramSid+'&isDetails=true' || 
            this._Adhocutility.adhocPreviousRoute == '/searchobj/device?objectType=Device&&keyword=' + this.model.keyWord + 'app=search' ||
            this._Adhocutility.adhocPreviousRoute == '/searchobj/alarm/alarmDetail?objectType=Alarm&sid='+this._Adhocutility.paramSid+'&isDetails=true&app=search' || 
            this._Adhocutility.adhocPreviousRoute ==  '/search/trendlog/trendDetail?objectType=Trendlog&sid='+this._Adhocutility.paramSid+'&isDetails=true&app=search' || 
            this._Adhocutility.adhocPreviousRoute == '/search/device?objectType=Device&&keyword='+this.model.keyWord+'app=search' || 
            this._Adhocutility.adhocPreviousRoute ==  '/searchobj/trendlog/trendDetail?objectType=Trendlog&sid='+this._Adhocutility.paramSid+'&isDetails=true&app=search' ||
            this._Adhocutility.adhocPreviousRoute == '/searchobj/device?objectType=Device&&keyword='+this.model.keyWord+'app=search' )
        ) {
          this.filter = this._Adhocutility.saveFilter;
          if (this._Adhocutility.checkedList.length > 0) {
            this._Adhocutility.checkedList.forEach(s => {
              this.searchList.forEach(l => {
                if (s.sid == l.sid) {
                  l.selected = true;
                  return;
                }
              });
            });
          }
          this.checked();
        } else {
          this.filter = '';
          this.showPlot = false;
          this._Adhocutility.checkedList = [];
          this._Adhocutility.checkNames = [];
        }
        this.count = this.searchList.length;
        this.p = 1;
        this.collectionSize = this.searchList.length;

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
  checked() {
    this.key = '';
    this.reverse = true;
    this.tempAray = [];
    this.tempAray = this.searchList;
    if (this._Adhocutility.checkedList.length > 0) {
      this._Adhocutility.checkedList.forEach(s => {
        this.tempAray.forEach((l, i) => {
          if (s.sid == l.sid) {
            this.searchList.splice(i, 1);
            return;
          }
        });
      });
    }
    this.tempAray1 = this.searchList.concat(this._Adhocutility.checkedList);
    this.searchList = this.tempAray1.map(x => Object.assign({}, x));
    this.p = 1;
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
}
 
}


