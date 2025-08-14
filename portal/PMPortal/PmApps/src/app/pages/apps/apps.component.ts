import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { AppService } from '../../PmCore/services/AppService/app-service.service';
import { Apps } from '../../PmModel/apps.model';
import { UtilityService } from '../../PmCore/services/utility.service';
import { AppRoutes } from './app-routes.enum';
import { AdhocAnalysis } from 'src/app/PmModel/adhoc-analysis';
import { TenantService, ReportingService } from 'src/app/PmCore/services';
import { CommonModel } from 'src/app/PmModel/common.model';
import { ToastrService } from 'ngx-toastr';
import { AppUtilService } from "src/app/PmCore/shared/app-util.service";
import { SearchUtilityService } from '../search/search-utility.service';
import { AdhocReportutilityService } from 'projects/AppAdhoc/src/app/adhoc-reportutility.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToolbarComponent } from 'src/app/layout';

@Component({
  selector: "app-apps",
  templateUrl: "./apps.component.html",
  styleUrls: ["./apps.component.scss"]
})
export class AppsComponent implements OnInit, OnDestroy {
  apps: any = [];
  routeUrl: string;
  public routesEnum = AppRoutes;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  public adhocModel: AdhocAnalysis = new AdhocAnalysis();
  showSpinner: boolean = true;
  tenants: any = [];
  tenantId: string;
  userDetails: any;
  isAuthorized: any;
  tenantLoadMessage: string = 'Loading..... Tenant';
  helper = new JwtHelperService();
  public commonModel: CommonModel;
  // public apps: Apps = new Apps();
  constructor(
    public route: ActivatedRoute,
    private appService: AppService,
    public tenantService: TenantService,
    private utilityService: UtilityService,
    private router: Router,
    private toastrService: ToastrService,
    public _utility: AppUtilService,
    public searchUtility: SearchUtilityService,
    public _Adhocutility: AdhocReportutilityService,
    public _reportService: ReportingService,
    public utility: UtilityService,
    public _toolbar: ToolbarComponent,

  ) {
    this.userDetails = localStorage.bearerToken;
    this.isAuthorized = this.helper.decodeToken(this.userDetails);
  }

  ngOnInit() {
    var mastertenantValue = localStorage.getItem('mastertenant');
    if (mastertenantValue == "true") {
      localStorage.setItem('mastertenant', 'false');
      this.tenantService.triggerTenantSelected(this._utility.tenantId);
    }
    this._toolbar.enablebutton();
    this.utility.entitySelected = "Reports"
    this._utility.showSpinner = false;
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
    //this.getTenantService();
    this.getAppsList();

  }


  getAppsList() {
    this.tenantService.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      tenant => {
        this.showSpinner = true;
        if (tenant.tenantId === undefined) {
          return;
        }
        if (this.tenantService.currentTenantValue.tenantId) {
          this._reportService.connectToReportServerForQuickConnectivityInApps(this.tenantService.currentTenantValue.tenantId).subscribe(resp => resp, err => { });
        }
        this.appService.getAppsList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          if (data) {
            this.showSpinner = false;
            this.apps = data;
          }
        }, err => {
          this.showSpinner = false;
          this.toastrService.error('Failed to get Apps list');
        });
      });
  }
  getApp(obj) {
    this._utility.appName = obj.appName;
    if (obj.normalizedAppName === "adhoc" && obj.isActive) {
      this.searchUtility.model.objectType = 'All';
      this.searchUtility.model.app = 'adhoc';
      this.searchUtility.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.searchUtility.model.userId = this.tenantService.currentTenantValue.userId;
      if (this.searchUtility.model.objectType == 'All') {
        this._Adhocutility.checkedList = [];
        this._Adhocutility.checkNames = [];
        this._Adhocutility.saveFilter = '';
        this.searchUtility.model.objectType = 'Alarm';
        this.router.navigate(['./search'], { queryParams: { objectType: this.searchUtility.model.objectType, keyword: this.searchUtility.model.keyWord, app: this.searchUtility.model.app } });
      }
      // this.router.navigate(['/home/appAdhoc'], { queryParams: { objectType: this.searchUtility.model.objectType, keyword: this.searchUtility.model.keyWord, app: 'adhoc' } });
    } else {
      if (!obj.isActive) {
        this.toastrService.warning('This App is not licensed. Please contact LogicMatter support');
        return;
      }
      this.routeUrl = this.routesEnum[obj.normalizedAppName] + '/' + obj.id;
      this._utility.appID = obj.id;
      this._utility.appName = obj.appName;
      this.router.navigateByUrl(this.routeUrl);
    }
  }
  getSelectedTenant(obj) {
    this.tenantService.getAllTenants(this.isAuthorized.userId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      if (resp) {
        resp.forEach(element => {
          if (element.id == obj.id) {
            this.commonModel.tenantId = obj.id;
            this.commonModel.tenantName = obj.tenantName;
            console.log(this.commonModel);
            this.tenantService.setData(this.commonModel);
          }
        });
      } else {
        this.toastrService.error("No tenants available");
      }
    }, err => {
      this.toastrService.error("Error occurred to fetch tenants");
    });
  }
  getTenantService() {
    this.tenantLoadMessage = 'Loading..... Tenant';
    this.tenantService.getAllTenants(this.isAuthorized.userId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      if (resp) {
        if (resp.length > 0) {
          this.tenants = resp;
          this.tenantId = this.tenants[0];
        }
        this.commonModel.tenantId = resp[0].id;
        this.commonModel.tenantName = this.tenants[0].tenantName;
        this.tenantService.setData(this.commonModel);
      } else {
        this.tenantLoadMessage = 'No Tenant configured';
        this.toastrService.error("No Tenant configured");
      }
    }, err => {
      this.tenantLoadMessage = 'Failed to fetch Tenant';
      this.toastrService.error("Error: Something went wrong. Failed to fetch Tenant");
    });

  }

  handleExtraTileClick() {
    console.log('Extra tile clicked');
    const baseUrl = window.location.pathname.replace(/\/home\/apps$/, '');
    const dynamicUrl = `/analytic/${this.tenantService.currentTenantValue.tenantId}`;
    const finalUrl = baseUrl + dynamicUrl;
    window.open(finalUrl, '_blank');
  }


  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
