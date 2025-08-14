
import {takeUntil} from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import { TenantService } from 'src/app/PmCore/services/TenantService/TenantService.service';
import { AdhocAnalysis } from 'src/app/PmModel/adhoc-analysis';
import { Location } from '@angular/common';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
import { AdhocService } from 'src/app/PmCore/services/AdhocService/adhoc-service.service';
import { AdhocReportutilityService } from '../adhoc-reportutility.service';

@Component({
    selector: 'app-adhoc-analysisdetails',
    templateUrl: './adhoc-analysisdetails.component.html',
    styleUrls: ['./adhoc-analysisdetails.component.scss']
})
export class AdhocDetailsComponent implements OnInit {
    searchList: any;
    sid: any;
    keyword: any;
    objectType: any;
    tenantId: any;
    dealerId: any;
    ngUnsubscribe: Subject<void> = new Subject<void>();
    userDetails: any;
    public adhocModel: AdhocAnalysis = new AdhocAnalysis();
    showSpinner: boolean;
    count: any;
    tenants: any;
    searchData: any = [];
    sub1: any;
    constructor(
        private route: ActivatedRoute,
        private tenant: TenantService,
        private location: Location,
        private router: Router,
        private coreUtility: CoreUtilityService,
        private adhocService: AdhocService,
        public _utility: AdhocReportutilityService,
    ) {
        this._subscribeRouteEvents();
        this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
        // this.adhocModel.dealerId = this.userDetails.userProfile['dealerId'];
    }

    private _subscribeRouteEvents(): void {
        this.router.events.subscribe(e => {
            if (!(e instanceof NavigationEnd)) { return; }
            window.scrollTo(0, 0);
        });
    }
    getTenants() {
        this.tenant.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
            tenant => {
                this.tenants = tenant;
                if (tenant === undefined) {
                return;
                }
                this.adhocModel.tenantId = tenant.tenantId;
                // this.utility.reportParams.dealerId = tenant.selectedTenant;
                this.getSearchDetails();
        }, err => {
            console.log(err);
        });
    }
    backParent() {
        this.location.back();
    }
    ngOnInit() {
        this.getTenants();
    }
    getSearchDetails() {

        this.showSpinner = true;
        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
            this.sub1 = this.route
                .queryParams
                .pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
                  this.adhocModel.sid = params.sid;
                  this._utility.paramSid = params.sid;
                    this.adhocModel.DevNum = params.DevNum;
                    this.adhocModel.objectType = params.objectType;
                    this.adhocModel.keyWord = params.keyWord;
                    // this.paramSid = params.sid;
                    // this.paramDevNum = params.DevNum;
                    if (this.adhocModel.objectType === 'Energy Log') {
                        this.adhocModel.objectType = 'Energylog';
                    }
                });
        });
        let searchData = this.adhocService.getObjectBySid(this.adhocModel).subscribe(
            searchInfo => {
                this.searchList = searchInfo;
                if (this.adhocModel.objectType === 'Energylog') {
                    this.searchData.push(searchInfo[0]);
                }
                this.count = this.searchList.length;
                this.showSpinner = false;
            });
    }
    public getSelectedSid(obj) {
        let tempArray = [];
        let tempArray1 = [];
       
        if(this.adhocModel.objectType == 'Trendlog'){
          tempArray1.push({ key: obj.sid, value: obj.logDescription + " (" + obj.objName + ")"});
            // this.coreUtility.checkNames = this._utility.checkNames.map(obj => {
            //     return { key: obj.sid, value: obj.logDescription };
            //   });
        }else {
          tempArray1.push({ key: obj.sid, value: obj.description + " (" + obj.objName + ")"});
            // this.coreUtility.checkNames = this._utility.checkNames.map(obj => {
            //     return { key: obj.sid, value: obj.description };
            //   });
        }
        tempArray.push(obj.sid);
        this.coreUtility.adhocDurationDesc = "";
    // this.coreUtility.reportParams.startDate = this.coreUtility.convert(this.tenants.startDate);
    // this.coreUtility.reportParams.endDate = this.coreUtility.convert(this.tenants.endDate);
    // this.coreUtility.reportParams.duration = this.coreUtility.selectedDateState;
        this.coreUtility.reportParams.objectType = this.adhocModel.objectType;
        this.coreUtility.reportParams.sidArray = tempArray;
        this.coreUtility.reportParams.objectName = tempArray1;
        this.coreUtility.reportParams.keyWord = this.adhocModel.keyWord;
      this.router.navigate(['appAdhoc/details']);
    }

    ngOnDestroy() {
        this.sub1.unsubscribe();
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
