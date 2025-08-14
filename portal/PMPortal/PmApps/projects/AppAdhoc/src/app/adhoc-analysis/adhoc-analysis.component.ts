import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Tenant } from 'src/app/PmModel/tenant.model';
import { CommonModel } from 'src/app/PmModel/common.model';
import { CommonDateModel } from 'src/app/PmModel/common-date.model';
import { AdhocAnalysis } from 'src/app/PmModel/adhoc-analysis';
import { Subject, Observable, Observer } from 'rxjs';
import { Location } from '@angular/common';
import { Router, ActivatedRoute, RoutesRecognized } from '@angular/router';
import { TenantService, SearchServiceService } from 'src/app/PmCore/services';
import { AdhocReportutilityService } from '../adhoc-reportutility.service';
import { UtilityService } from 'src/app/PmCore/services/utility.service';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
import { AdhocService } from 'src/app/PmCore/services/AdhocService/adhoc-service.service';
import { takeUntil, filter, pairwise } from 'rxjs/operators';
import { SearchUrls } from 'src/app/PmCore/helpers/search-urls';
import { AppUtilService, DeleteDialog } from 'src/app/PmCore/shared/app-util.service';
import { MatDialog } from '@angular/material/dialog';
import { Search } from 'src/app/PmModel/search.model';
import { SearchUtilityService } from 'src/app/pages/search/search-utility.service';

export interface searchTabs {
  label: string;
  route: any;
  index: string;
}
@Component({
  selector: "adhoc-analysis",
  templateUrl: './adhoc-analysis.component.html',
  styleUrls: ['./adhoc-analysis.component.scss']
})
export class AdhocAnalysisComponent implements OnInit {
  navLinks: any[];
  activeLinkIndex = -1;
  public model: Search = new Search();
  ngUnsubscribe: Subject<void> = new Subject<void>();
  isDetails: any;
  constructor(public route: ActivatedRoute,
    private tenantService: TenantService,
    public _Adhocutility: AdhocReportutilityService,
    public searchUtility: SearchUtilityService,
    private router: Router,
    private cdr: ChangeDetectorRef) {
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
      this.navLinks = [];
      if (this.searchUtility.model.objectType == 'All') {
        this.model.objectType = 'Alarm';
        this.searchUtility.model.objectType = this.model.objectType;
      }
      // if(this.searchUtility.model.objectType == 'All'){
      this.navLinks = [
        {
          label: 'Alarm',
          link: './alarm', queryParams: { objectType: this.model.objectType, keyword: this.model.keyWord, app: 'search' },
          index: 0
        },
        {
          label: 'Trendlog',
          link: './trendlog', queryParams: { objectType: this.model.objectType, keyword: this.model.keyWord, app: 'search' },
          index: 1
        },
      ];
    });
  }
  ngOnInit(): void {
    this.router.events.subscribe((res) => {
      this.activeLinkIndex = this.navLinks.indexOf(this.navLinks.find(tab => tab.link === '.' + this.router.url + { queryParams: { objectType: this.model.objectType, keyword: this.model.keyWord, app: 'search' } }));
    });
  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }
}
