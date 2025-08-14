import { takeUntil } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { TenantService } from '../../../../PmCore/services/TenantService/TenantService.service';
import { SearchServiceService } from '../../../../PmCore/services/SearchService/SearchService.service';
import { Search } from '../../../../PmModel/search.model';
import { Location } from '@angular/common';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
import { AdhocReportutilityService } from 'projects/AppAdhoc/src/app/adhoc-reportutility.service';
import { AppUtilService, DeleteDialog } from '../../../../PmCore/shared/app-util.service';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-alarm-detail',
  templateUrl: './alarm-detail.component.html',
  styleUrls: ['./alarm-detail.component.scss']
})
export class AlarmDetailComponent implements OnInit {
  searchList: any;
  sid: any;
  keyword: any;
  objectType: any;
  tenantId: any;
  dealerId: any;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  userDetails: any;
  public model: Search = new Search();
  showSpinner: boolean;
  count: any;
  tenants: any;
  searchData: any = [];
  sub1: any;
  constructor(
    private route: ActivatedRoute,
    private tenant: TenantService,
    private search: SearchServiceService,
    private location: Location,
    private router: Router,
    private coreUtility: CoreUtilityService,
    public _utility: AdhocReportutilityService,
    public _appUtility: AppUtilService,
    public dialog: MatDialog
  ) {
    this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
    // this.model.dealerId = this.userDetails.userProfile['dealerId'];
  }
  getTenants() {
    this.tenant.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      tenant => {
        this.tenants = tenant;
        if (tenant === undefined) {
          return;
        }
        this.model.tenantId = tenant.tenantId;
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
    console.log(this.router.url);
    this.getTenants();
  }
  getSearchDetails() {

    this.showSpinner = true;
    this.route.paramMap.subscribe(params => {
      //            this.model.sid = params.sid;
      //             this.model.DevNum = params.DevNum;
      //             this.model.objectType = params.objectType;
      //           this.model.keyWord = params.keyWord;
      //           this._utility.paramSid = params.sid;
      //             // this.paramSid = params.sid;
      //             // this.paramDevNum = params.DevNum;
      //             if (this.model.objectType === 'Energy Log') {
      //                 this.model.objectType = 'Energylog';
      //             }
      //         });
    });
    this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.sub1 = this.route
        .queryParams
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
          this.model.sid = params.sid;
          this.model.DevNum = params.DevNum;
          this.model.objectType = params.objectType;
          this.model.keyWord = params.keyWord;
          this._utility.paramSid = params.sid;
          // this.paramSid = params.sid;
          // this.paramDevNum = params.DevNum;
          if (this.model.objectType === 'Energy Log') {
            this.model.objectType = 'Energylog';
          }
        });
    });
    let searchData = this.search.getSearchListBySid(this.model).subscribe(
      searchInfo => {
        this.searchList = searchInfo;
        if (this.model.objectType === 'Energylog') {
          this.searchData.push(searchInfo[0]);
        }
        this.count = this.searchList.length;
        console.log(this.searchList);
        this.showSpinner = false;
      });
  }
  public getSelectedSid(obj) {
    // if (this._appUtility.licenseInfo.isLimitedEdition) {
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
    let tempArray = [];
    let tempArray1 = [];
    if (this.model.objectType == 'Trendlog') {
      tempArray1.push({ key: obj.sid, value: obj.logDescription + " (" + obj.objName + ")" });
      // this.coreUtility.checkNames = this._utility.checkNames.map(obj => {
      //     return { key: obj.sid, value: obj.logDescription };
      //   });
    } else {
      tempArray1.push({ key: obj.sid, value: obj.description + " (" + obj.objName + ")" });
      // this.coreUtility.checkNames = this._utility.checkNames.map(obj => {
      //     return { key: obj.sid, value: obj.description };
      //   });
    }
    tempArray.push(obj.sid);
    console.log(tempArray);
    this.coreUtility.adhocDurationDesc = "";
    // this.coreUtility.reportParams.startDate = this.coreUtility.convert(this.tenants.startDate);
    // this.coreUtility.reportParams.endDate = this.coreUtility.convert(this.tenants.endDate);
    // this.coreUtility.reportParams.duration = this.coreUtility.selectedDateState;
    this.coreUtility.reportParams.objectType = this.model.objectType;
    this.coreUtility.reportParams.sidArray = tempArray;
    this.coreUtility.reportParams.objectName = tempArray1;
    this.coreUtility.reportParams.keyWord = this.model.keyWord;
    console.log(this.coreUtility.reportParams.sidArray);
    this._appUtility.previousTenant = undefined;
    this.router.navigate(['appAdhoc/details']);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
