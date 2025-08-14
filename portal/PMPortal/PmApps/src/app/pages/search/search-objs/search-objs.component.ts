import { Component, OnInit } from '@angular/core';
import { SearchUtilityService } from '../search-utility.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdhocReportutilityService } from 'projects/AppAdhoc/src/app/adhoc-reportutility.service';
import { Search } from 'src/app/PmModel/search.model';
import { TenantService } from 'src/app/PmCore/services';
import { CommonModel } from 'src/app/PmModel/common.model';
import { UtilityService } from 'src/app/PmCore/services/utility.service';
import { AppUtilService } from 'src/app/PmCore/shared/app-util.service';
@Component({
  selector: 'app-search-objs',
  templateUrl: './search-objs.component.html',
  styleUrls: ['./search-objs.component.scss']
})
export class SearchObjsComponent implements OnInit {
  navLinks: any[];
  activeLinkIndex = -1;
  public model: Search = new Search();
  ngUnsubscribe: Subject<void> = new Subject<void>();
  isDetails: any;
  constructor(public route: ActivatedRoute,
    private tenantService: TenantService,
    public _Adhocutility: AdhocReportutilityService,
    public utility: UtilityService,
    private _utility: AppUtilService,
    public searchUtility: SearchUtilityService, private router: Router) {
      this.router.routeReuseStrategy.shouldReuseRoute = function () {
        return false;
      };
    // this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => { 
    //   this.model.keyWord = params.keyword;
    //   this.model.objectType = params.objectType;
    //   this.model.DevNum = params.DevNum;
    //   this._Adhocutility.paramDevNum = params.DevNum;
    //   this.model.sid = params.sid;
    //   this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
    //   this.model.userId = this.tenantService.currentTenantValue.userId;
    //   this.model.app = params.app;
    //   this.isDetails = params.isDetails;
    //   this.searchUtility.model = this.model;
    //   this.navLinks = [];
    //   if (this.utility.pattern.exec(this.searchUtility.model.keyWord) !== null) {
    //     if (
    //       this.utility.pattern.exec(this.searchUtility.model.keyWord)[0] === '*' ||
    //       this.utility.pattern.exec(this.searchUtility.model.keyWord)[0] === '?'
    //     ) {
    //       this.utility.patternShow = true;
    //       if (this.utility.pattern.exec(this.searchUtility.model.keyWord)[0] === '*') {
    //         this.utility.patternInfo = '\'*\'- Represents zero or more characters';
    //       }
    //       if (this.utility.pattern.exec(this.searchUtility.model.keyWord)[0] === '?') {
    //         this.utility.patternInfo = '\'?\'- Represents a single character';
    //       }
    //     } else {
    //       this.utility.patternShow = false;
    //     }
    //   } else {
    //     this.utility.patternShow = false;
    //   }
    //   if(this.isDetails != true){
    //     if(this.searchUtility.model.objectType == 'Device'){
    //       this.navLinks = [
    //         {
    //           label: 'Device',
    //           link: './device',
    //           index: 0
    //         }
    //       ]
    //       this.router.navigate(['./searchobj/device'], { queryParams: { objectType: this.searchUtility.model.objectType, keyword: this.searchUtility.model.keyWord, DevNum:this.searchUtility.model.DevNum,app: 'search' } })
    //     }
    //     else if(this.searchUtility.model.objectType == 'Energylog'){
    //       this.searchUtility.model.objectType = 'Energylog'
    //       this.navLinks = [
    //         {
    //           label: 'Energy Log',
    //           link: './energylog',
    //           index: 0
    //         }
    //       ]
    //       this.router.navigate(['./searchobj/energylog'], { queryParams: { objectType: this.searchUtility.model.objectType, keyword: this.searchUtility.model.keyWord, DevNum:this.searchUtility.model.DevNum, app: 'search' } })
    //     }
    //     else if(this.searchUtility.model.objectType == 'Alarm'){
    //       this.navLinks = [
    //         {
    //           label: 'Alarm',
    //           link: './alarm',
    //           index: 0
    //         }
    //       ]
    //       this.router.navigate(['./searchobj/alarm'], { queryParams: { objectType: this.searchUtility.model.objectType, keyword: this.searchUtility.model.keyWord, DevNum:this.searchUtility.model.DevNum, app: 'search' } })
    //     }
    //     else if(this.searchUtility.model.objectType == 'Points'){
    //       this.navLinks = [
    //         {
    //           label: 'Points',
    //           link: './points',
    //           index: 0
    //         }
    //       ]
    //       this.router.navigate(['./searchobj/points'], { queryParams: { objectType: this.searchUtility.model.objectType, keyword: this.searchUtility.model.keyWord, DevNum:this.searchUtility.model.DevNum, app: 'search' } })
    //     }
    //     else if(this.searchUtility.model.objectType == 'Reports'){
    //       this.navLinks = [
    //         {
    //           label: 'Reports',
    //           link: './reports',
    //           index: 0
    //         }
    //       ]
    //       this.router.navigate(['./searchobj/reports'], { queryParams: { objectType: this.searchUtility.model.objectType, keyword: this.searchUtility.model.keyWord,  DevNum:this.searchUtility.model.DevNum,app: 'search' } })
    //     }
    //     else if(this.searchUtility.model.objectType == 'Trendlog'){
    //       this.navLinks = [
    //         {
    //           label: 'Trendlog',
    //           link: './trendlog',
    //           index: 0
    //         }
    //       ]
    //       this.router.navigate(['./searchobj/trendlog'], { queryParams: { objectType: this.searchUtility.model.objectType, keyword: this.searchUtility.model.keyWord,  DevNum:this.searchUtility.model.DevNum,app: 'search' } })
    //     }
    //   }
    
    // });
   
    
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
      if(this._Adhocutility.keyWord){
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
      if(this.isDetails != "true"){
        if(this.searchUtility.model.objectType == 'Device'){
          this.navLinks = [
            {
              label: 'Device',
              link: './device',
              index: 0
            }
          ]
          this.router.navigate(['./searchobj/device'], { queryParams: { objectType: this.searchUtility.model.objectType, keyword: this.searchUtility.model.keyWord, DevNum:this.searchUtility.model.DevNum,app: 'search' } })
        }
        else if(this.searchUtility.model.objectType == 'Energylog'){
          this.searchUtility.model.objectType = 'Energylog'
          this.navLinks = [
            {
              label: 'Energy Log',
              link: './energylog',
              index: 0
            }
          ]
          this.router.navigate(['./searchobj/energylog'], { queryParams: { objectType: this.searchUtility.model.objectType, keyword: this.searchUtility.model.keyWord, DevNum:this.searchUtility.model.DevNum, app: 'search' } })
        }
        else if(this.searchUtility.model.objectType == 'Alarm'){
          this.navLinks = [
            {
              label: 'Alarm',
              link: './alarm',
              index: 0
            }
          ]
          this.router.navigate(['./searchobj/alarm'], { queryParams: { objectType: this.searchUtility.model.objectType, keyword: this.searchUtility.model.keyWord, DevNum:this.searchUtility.model.DevNum, app: 'search' } })
        }
        else if(this.searchUtility.model.objectType == 'Points'){
          this.navLinks = [
            {
              label: 'Points',
              link: './points',
              index: 0
            }
          ]
          this.router.navigate(['./searchobj/points'], { queryParams: { objectType: this.searchUtility.model.objectType, keyword: this.searchUtility.model.keyWord, DevNum:this.searchUtility.model.DevNum, app: 'search' } })
        }
        else if(this.searchUtility.model.objectType == 'Reports'){
          this.navLinks = [
            {
              label: 'Reports',
              link: './reports',
              index: 0
            }
          ]
          this.router.navigate(['./searchobj/reports'], { queryParams: { objectType: this.searchUtility.model.objectType, keyword: this.searchUtility.model.keyWord,  DevNum:this.searchUtility.model.DevNum,app: 'search' } })
        }
        else if(this.searchUtility.model.objectType == 'Transformers'){
          this.navLinks = [
            {
              label: 'Transformers',
              link: './transformers',
              index: 0
            }
          ]
          this.router.navigate(['./searchobj/transformers'], { queryParams: { objectType: this.searchUtility.model.objectType, keyword: this.searchUtility.model.keyWord,  DevNum:this.searchUtility.model.DevNum,app: 'search' } })
        }
        else if(this.searchUtility.model.objectType == 'Trendlog'){
          this.navLinks = [
            {
              label: 'Trendlog',
              link: './trendlog',
              index: 0
            }
          ]
          this.router.navigate(['./searchobj/trendlog'], { queryParams: { objectType: this.searchUtility.model.objectType, keyword: this.searchUtility.model.keyWord,  DevNum:this.searchUtility.model.DevNum,app: 'search' } })
        }
      }
    
    });
   
    this.router.events.subscribe((res) => {
      this.activeLinkIndex = this.navLinks.indexOf(this.navLinks.find(tab => tab.link === '.' + this.router.url));
  });

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
}
}
