import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SearchUtilityService } from '../search-utility.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdhocReportutilityService } from 'projects/AppAdhoc/src/app/adhoc-reportutility.service';
import { Search } from 'src/app/PmModel/search.model';
import { SearchServiceService, TenantService } from 'src/app/PmCore/services';
import { CommonModel } from 'src/app/PmModel/common.model';
import { UtilityService } from 'src/app/PmCore/services/utility.service';
import { AppUtilService } from 'src/app/PmCore/shared/app-util.service';


@Component({
  selector: 'app-search-home',
  templateUrl: './search-home.component.html',
  styleUrls: ['./search-home.component.scss']
})
export class SearchHomeComponent implements OnInit {
  navLinks: any[];
  activeLinkIndex = -1;

  public model: Search = new Search();
  ngUnsubscribe: Subject<void> = new Subject<void>();
  isDetails: any;
  lic: any;
  constructor(public route: ActivatedRoute,
    public tenantService: TenantService,
    public _Adhocutility: AdhocReportutilityService,
    public searchUtility: SearchUtilityService,
    readonly searchService: SearchServiceService,
    private router: Router,
    private _utility: AppUtilService,
    public utility: UtilityService,
    private cdr: ChangeDetectorRef) {


  }
  ngOnInit(): void {

    this._utility.showSpinner = false;
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.model.keyWord = params.keyword;
      this.model.objectType = params.objectType;
      this.model.DevNum = params.DevNum;
      this._Adhocutility.paramDevNum = params.DevNum;
      this.model.sid = params.sid;
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      if (this._Adhocutility.keyWord) {
        this.model.keyWord = this._Adhocutility.keyWord;
      }
      this.model.app = params.app;
      this.isDetails = params.isDetails;
      this.searchUtility.model = this.model;
      this.navLinks = [];
      if (this.utility.pattern.exec(this.searchUtility.model.keyWord) !== null) {
        if (
          this.utility.pattern.exec(this.searchUtility.model.keyWord)[0] === '*' ||
          this.utility.pattern.exec(this.searchUtility.model.keyWord)[0] === '?'
        ) {
          this.utility.patternShow = true;
          if (this.utility.pattern.exec(this.searchUtility.model.keyWord)[0] === '*') {
            this.utility.patternInfo = '\'*\'- Represents zero or more characters';
          }
          if (this.utility.pattern.exec(this.searchUtility.model.keyWord)[0] === '?') {
            this.utility.patternInfo = '\'?\'- Represents a single character';
          }
        } else {
          this.utility.patternShow = false;
        }
      } else {
        this.utility.patternShow = false;
      }
      if (this.searchUtility.model.objectType == 'All') {
        this._Adhocutility.checkedList = [];
        this._Adhocutility.checkNames = [];
        this.model.objectType = this._utility.lic === 'BMS' ? 'Alarm' : 'Reports';
        this.searchUtility.model.objectType = this.model.objectType;
      }
      if (this.model.app != 'adhoc') {
        this.navLinks = this.utility.objectTypes
      }
      else {
        this.navLinks = [];
        this.navLinks = [
          {
            value: "All",
            viewValue: "All"
          },
          {
            label: 'Alarm',
            link: './alarm', queryParams: { objectType: this.model.objectType, keyword: this.model.keyWord, app: 'search' },
            index: 0
          },
          {
            label: 'Trendlog',
            link: './trendlog', queryParams: { objectType: this.model.objectType, keyword: this.model.keyWord, app: 'search' },
            index: 1
          }
        ];
      }

    });
    this.router.events.subscribe((res) => {
      this.activeLinkIndex = this.navLinks.indexOf(this.navLinks.find(tab => tab.link === '.' + this.router.url + { queryParams: { objectType: this.model.objectType, keyword: this.model.keyWord, app: 'search' } }));
    });

  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }
  ngOnChanges() {
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.model.keyWord = params.keyword;
      this.model.objectType = params.objectType;
      this.model.DevNum = params.DevNum;
      this._Adhocutility.paramDevNum = params.DevNum;
      this.model.sid = params.sid;
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.app = params.app;
      this.isDetails = params.isDetails;
      this.searchUtility.model = this.model;
    });
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
