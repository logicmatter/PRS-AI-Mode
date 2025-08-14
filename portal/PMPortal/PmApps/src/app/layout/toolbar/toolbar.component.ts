import { Component, OnInit, Output, EventEmitter, Input, Inject } from '@angular/core';
import * as $ from 'jquery';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef } from '@angular/core';
// Services
import { TenantService } from '../../PmCore/services/TenantService/TenantService.service';
import { FileSystemService } from '../../PmCore/services/FileSystemService/FileSystemService.service';
import { UserService } from '../../PmCore/services/UserService/UserService.service';
import { UtilityService } from '../../PmCore/services/utility.service';
// Models
import { Search } from '../../PmModel/search.model';
import { CommonModel } from '../../PmModel/common.model';
import {
  DateTimeAdapter,
  OWL_DATE_TIME_FORMATS,
  OWL_DATE_TIME_LOCALE,
  OwlDateTimeComponent,
  OwlDateTimeFormats,
} from 'ng-pick-datetime-ex';
import * as _moment from 'moment';
import { Moment } from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Jwt Decoder
import { JwtHelperService } from '@auth0/angular-jwt';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
import { CommonDateModel } from 'src/app/PmModel/common-date.model';
import { SearchUtilityService } from 'src/app/pages/search/search-utility.service';
import { AdhocReportutilityService } from 'projects/AppAdhoc/src/app/adhoc-reportutility.service';
import { AppUtilService } from 'src/app/PmCore/shared/app-util.service';
import { WebsiteService, ReportingService, SearchServiceService } from 'src/app/PmCore/services';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {
  mobileQuery: MediaQueryList;
  isExpanded = false;
  private _mobileQueryListener: () => void;
  helper = new JwtHelperService();
  @Output() menuState = new EventEmitter();
  @Input() duration: string;
  formGroup: FormGroup;
  filled;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  tenants: any = [];
  domain: any;
  tenantId: string;
  showMenu = false; /* false by default, since hidden */
  entitySelected: any;
  searchPlaceHolder: string = 'Name /Description /Type';
  public model: Search = new Search();
  public commonModel: CommonModel;
  userName: string;
  accessGlobal: boolean = true;
  objectTypes = [];
  searchTypeChange = new EventEmitter<string>()
  post: any;
  userDetails: any;
  isAuthorized: any;
  assemblyVersion: string = '';
  appVersion: string = '';
  build: string = '';
  public commonDateModel: CommonDateModel;
  imageUrl: any;
  tenantLoadMessage: string = 'Loading..... Tenant';
  analyticMode: boolean = true;
  analyticModebasic: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private tenantService: TenantService,
    private fileSystemService: FileSystemService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    public utility: UtilityService,
    public _utility: AppUtilService,
    public searchUtility: SearchUtilityService,
    public coreService: CoreUtilityService,
    public _Adhocutility: AdhocReportutilityService,
    public websiteService: WebsiteService,
    private toastrService: ToastrService,
    public reportConfig: ReportingService,
    readonly searchService: SearchServiceService,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    @Inject('BASE_URL') private baseUrl: string
  ) {
    this.searchService.GetSearchObject().subscribe(resp => {
      this.objectTypes = resp;
      this.utility.objectTypes = resp;
      this.mobileQuery = media.matchMedia('(max-width: 600px)');
      this._mobileQueryListener = () => changeDetectorRef.detectChanges();
      this.mobileQuery.addListener(this._mobileQueryListener);
      this.getPortalConfig();
      this.commonModel = new CommonModel();
      this.utility.entitySelected = this.objectTypes[0].value;
      this.userDetails = localStorage.bearerToken;
      this.isAuthorized = this.helper.decodeToken(this.userDetails);
      this._utility.userName = this.isAuthorized.sub;
      if (this.utility.entitySelected == undefined) {
        this.utility.entitySelected = this.objectTypes[0].value;
      }
    }, error => {
      console.log(error);
    });

  }

  ngOnInit() {
    this.getPortalConfig();
    this.getWebsiteConfig();
    this.getPointMatterVersion();
    this.searchForm();
    this.activateClickEvent();
  }
  getPortalConfig() {
    this.reportConfig.getAppSettingConfig().subscribe(data => {
      console.log(data);
      this._utility.reportFormat = data.reportSettings.reportFormat;
      this.coreService.resolutions = data.reportSettings.resolutions;
      console.log(this.coreService.resolutions);

    });
  }
  onToggleClick() {
    if (this.analyticModebasic) {
      this._utility.isGrafana = true;
      this._utility.isGrafanareset = true;
    } else {
      this._utility.isGrafana = false;
      this._utility.isGrafanareset = false;
    }
  }

  getWebsiteConfig() {
    this.websiteService.getWebsiteLogo().pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      this.websiteService.siteTopLogo = resp.siteLogo;
    }, err => {

    });
  }
  // Get Tenant List and Get Selected Tenant
  // Tenant List Start
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
          this.tenantId = this.tenants[0].id;
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

  // Tenant List End

  // Open sideNavigation on Click
  toggleSidenavBar() {
    // $('.sidenav-toggle').on("click", function () {
    // $('body').toggleClass('show');
    // });
    this.isExpanded = !this.isExpanded
  }

  // User Logout
  logout() {
    this.userService.logout().pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      resp => {
        window.location.href = 'auth/login';
      }
    );
  }


  // Date Picker Slider
  activateClickEvent() {
    $(document).ready(function () {
      $('.toggle-tenants').click(function (e) {
        if ($('.show-tenatsdatepicker').is(":hidden")) {
          $('.app-content > mat-card').css('padding-top', '85px');
        } else {
          if ($(document).width() <= 1024) {
            $('.app-content > mat-card').css('padding-top', '63px');
          } else {
            $('.app-content > mat-card').css('padding-top', '35px');
          }
        }
        $('.show-tenatsdatepicker').slideToggle();
      });
    });
  }

  enablebutton() {
    this._utility.isGrafanaedit = this._utility.isCreateReport = false;
    if (this._utility.pmanalyticmode) {
        this._utility.pmanalyticmode = false;
        this.activateClickEvent();
    }
}

  getPointMatterVersion() {
    this.fileSystemService.getPointMatterVersion().subscribe(resp => {
      if (resp.status) {
        this.appVersion = 'Not available';
      } else {
        this.assemblyVersion = resp.assemblyVersion;
        this.appVersion = resp.appVersion;
        let version = this.appVersion.split('.');
        this.build = version[version.length - 2];
        this.appVersion = version[0] + '.' + version[1] + '.' + this.build.substr(0, 2);
        this.build = this.build.substr(2) + "." + version[version.length - 1];
      }
    });
  }
  // Object and Report Search
  // search start
  searchForm() {
    this.formGroup = this.formBuilder.group({
      'keyword': [null],
      'objectType': [null],
    });

    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.model.keyWord = params.keyword;
      this.model.objectType = params.objectType;
      this.model.tenantId = this.tenantService.currentTenantValue.tenantId;
      this.model.userId = this.tenantService.currentTenantValue.userId;
      this.model.app = params.app;
      this.model.DevNum = params.DevNum;
      this.model = this.model;
    });
  }

  // Type Change Method
  // onchange Start
  onChangeSearchDropdown(objectType) {
    this.model.objectType = objectType;
    this.utility.entitySelected = this.model.objectType;
    if (this.model.objectType === 'Energy Log') {
      this.utility.entitySelected = 'Energy Log';
      this.model.objectType = 'Energylog';
    } else
      if (objectType === 'Device') {
        this.searchPlaceHolder = 'Device Name / Device Description / Device Instance';
      } else
        if (objectType === 'Alarm') {
          this.searchPlaceHolder = 'Alarm Name / Alarm Description / Device Instance';
        } else
          if (objectType === 'Trendlog') {
            this.searchPlaceHolder = 'Trendlog Name / Trendlog Description / Device Instance';
          } else
            if (objectType === 'Energylog') {
              this.searchPlaceHolder = 'Energy Log Description / Device Instance';
            } else
              if (objectType === 'Points') {
                this.searchPlaceHolder = 'Point Name / Point Type / Point Description / Device Instance / Point Instance';
              } else
                if (objectType === 'All') {
                  this.searchPlaceHolder = 'Name / Description / ObjectType / Device Instance';
                } else
                  if (objectType === 'Reports') {
                    this.searchPlaceHolder = 'Report Name / Report Description';
                  } else
                    if (objectType === 'Transformers' || 'Exporter' || 'Importer' || 'Maintainer') {
                      this.searchPlaceHolder = 'Select Report Type From Left Dropdown to Search ';
                    }

  }
  // onchange End

  // onSubmit Search
  // onSubmit start
  onSubmit(post) {
    if (!(this.formGroup.valid)) {
      return;
    } else
      if (post.objectType == null) {
        post.objectType = this.utility.entitySelected;
      }
    this.post = post;
    this.model.keyWord = this.post.keyword;
    this.model.objectType = this.post.objectType;
    this._Adhocutility.keyWord = this.post.keyword;
    this.model.app = 'search'
    if (this.model.objectType == 'All') {
      this._Adhocutility.saveFilter = '';
      this._Adhocutility.checkedList = [];
      this._Adhocutility.checkNames = [];
      if (this._utility.lic === "BMS") {
        this.model.objectType = 'Alarm';
        this.searchUtility.model = this.model;
        this.router.navigate(['./search/alarm'], { queryParams: { objectType: this.model.objectType, keyword: this.post.keyword, app: this.model.app } });
      }
      else {
        this.model.objectType = 'Reports';
        this.searchUtility.model = this.model;
        this.router.navigate(['./search/reports'], { queryParams: { objectType: this.model.objectType, keyword: this.post.keyword, app: this.model.app } });
      }


    }
    else {
      if (this.model.keyWord != this.searchUtility.model.keyWord) {
        this._Adhocutility.saveFilter = '';
        this._Adhocutility.checkedList = [];
        this._Adhocutility.checkNames = [];
        this.searchUtility.model = this.model;
        this.router.navigate(['./searchobj/' + this.model.objectType.toLocaleLowerCase()], { queryParams: { objectType: this.post.objectType, keyword: this.post.keyword, app: this.model.app } });
      }
      if (this.model.objectType != this.searchUtility.model.objectType) {
        this._Adhocutility.saveFilter = '';
        this._Adhocutility.checkedList = [];
        this._Adhocutility.checkNames = [];
        this.searchUtility.model = this.model;
        this.router.navigate(['./searchobj/' + this.model.objectType.toLocaleLowerCase()], { queryParams: { objectType: this.post.objectType, keyword: this.post.keyword, app: this.model.app } });
      }
      else if (this.model.objectType == this.searchUtility.model.objectType && this.router.url.indexOf("searchobj") < 0) {
        this._Adhocutility.saveFilter = '';
        this._Adhocutility.checkedList = [];
        this._Adhocutility.checkNames = [];
        this.searchUtility.model = this.model;
        this.router.navigate(['./searchobj/' + this.model.objectType.toLocaleLowerCase()], { queryParams: { objectType: this.post.objectType, keyword: this.post.keyword, app: this.model.app } });
      }
      else {
        return;
      }

      // this.searchUtility.getSearchResults(this.searchUtility.model);
    }


    //console.log(post);

    // this.router.navigate(['/home/search'], { queryParams: { objectType: post.objectType, keyword: post.keyword, app: 'search' } });

  }

  onChangeKeyword() {
    this.searchUtility.model.keyWord = this.model.keyWord;
    this.searchUtility.model.objectType = this.model.objectType;
    // this.searchUtility.model.app = 'search'? this.searchUtility.model.app = 'search': this.searchUtility.model.app = 'adhoc'
  }

  // onSubmit end
  // Search end

  openSearchDialog(): void {
    const dialogRef = this.dialog.open(SearchDialog, {
      width: 'auto',
      data: { objectType: this.model.objectType, keyword: this.model.keyWord }
    });

    dialogRef.afterClosed().subscribe(result => {
      // this.model.keyWord = result.keyword;
      this.onSubmit(result);
    });
  }

  openDateRangeDialog(): void {
    const dialogRef = this.dialog.open(DateRangeDialog, {
      width: 'auto',
      data: { arsStartDate: this.commonDateModel.startDate, arsEndDate: this.commonDateModel.endDate, selectedState: this.commonDateModel.duration }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.commonDateModel.startDate = result.arsStartDate;
      this.commonDateModel.endDate = result.arsEndDate;
      this.commonDateModel.duration = result.selectedState
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  openDocLink() {
    window.open("http://3.17.133.142/documentation/");
  }
  openSupLink() {
    window.open("https://logicmatter.com/contact/");
  }
}
@Component({
  selector: 'search-dialog',
  templateUrl: 'search-dialog.html',
  styleUrls: ['search-dialog.scss']
})
// tslint:disable-next-line: component-class-suffix
export class SearchDialog {
  objectTypes = [
  ];
  searchPlaceholder: string;

  constructor(
    public dialogRef: MatDialogRef<SearchDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public utility: UtilityService

  ) {
    if (this.utility.entitySelected == undefined) {
      this.utility.entitySelected = this.objectTypes[0].value;
    }
    this.onChangeObjectTypeDropdown(this.utility.entitySelected);
  }

  onNoClick(): void {
    console.log('close dialog')
    this.dialogRef.close();
  }
  onChangeObjectTypeDropdown(e) {
    switch (e) {
      case "Alarm": {
        this.searchPlaceholder = 'Alarm Name / Alarm Description / Device Instance';
        break;
      }
      case "Device": {
        this.searchPlaceholder = 'Device Name / Device Description / Device Instance';
        break;
      }
      case "Energylog": {
        this.searchPlaceholder = 'Energy Log Description / Device Instance';
        break;
      }
      case "Points": {
        this.searchPlaceholder = 'Point Name / Point Type / Point Description / Device Instance / Point Instance';
        break;
      }
      case "Trendlog": {
        this.searchPlaceholder = 'Trendlog Name / Trendlog Description / Device Instance';
        break;
      }
      case "Reports": {
        this.searchPlaceholder = 'Report Name / Report Description';
      }
      case "Transformers": {
        this.searchPlaceholder = 'Trasnformer Name / Trasnformer Description';
      }
      default: {
        this.searchPlaceholder = 'Object Name / Object Description / Object Type / Device Instance';
        break;
      }
    }

  }

}

@Component({
  selector: 'daterange-dialog',
  templateUrl: 'daterange-dialog.html',

})
export class DateRangeDialog {
  customDay = [
    { value: 'today', viewValue: 'Today' },
    { value: 'yesterday', viewValue: 'Yesterday' },
    { value: 'currentweek', viewValue: 'Current Week' },
    { value: 'lastweek', viewValue: 'Last Week' },
    { value: 'currentmonth', viewValue: 'Current Month' },
    { value: 'lastmonth', viewValue: 'Last Month' },
    { value: 'currentquarter', viewValue: 'Current Quarter' },
    { value: 'lastquarter', viewValue: 'Last Quarter' },
    { value: 'currentyear', viewValue: 'Current Year' },
    { value: 'lastyear', viewValue: 'Last Year' },
    { value: 'custom', viewValue: 'Custom' }
  ];
  selectedState: any;
  selectedState1: any;
  public disableTime: boolean = false;
  public startAt = 'month';
  public pickUp = 'both';
  public myFilter;
  public myFilter1;
  public arsStartDate = new Date();
  public arsEndDate = new Date();
  public maxDate: any;
  public maxDate1: any;
  public showMonth: boolean = false;
  public dayOf = null;
  errorMsg: string = "";
  isDateRangeValid: boolean = true;
  minDate: Date;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  /* durationType: string;
   durationInfo = [
       { value: 'daily', viewValue: 'Daily' },
       { value: 'week', viewValue: 'Weekly'},
       { value: 'month', viewValue: 'Monthly' }

   ];*/
  constructor(
    public dialogRef: MatDialogRef<SearchDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public utility: UtilityService,
    private tenantService: TenantService,
    public coreService: CoreUtilityService

  ) {
    /* if (this._utility.durationType == undefined)
     this._utility.durationType = this.durationInfo[0].value; */
    if (data.selectedState == undefined) {
      this.selectedState = this.customDay[0].value;
    } else {
      this.selectedState = data.selectedState;
    }
    this.arsStartDate = data.arsStartDate;
    this.arsEndDate = data.arsEndDate;
    this.selectedState = this.customDay[0].value;
    this.utility.maxDateCalendar = new Date();


  }
  onChange1(newValue) {
    this.disableTime = true;
    if (this.selectedState == "today") {
      this.pickUp = "both";
      this.startAt = "month";
      this.myFilter = false;
      this.myFilter1 = false;
      this.getstartEndDates(this.selectedState);
    } else if (this.selectedState == "yesterday") {
      this.getstartEndDates(this.selectedState);
    } else if (this.selectedState == "currentweek") {
      this.getstartEndDates(this.selectedState);
    } else if (this.selectedState == "lastweek") {
      this.getstartEndDates(this.selectedState);
    } else if (this.selectedState == "currentmonth") {
      this.getstartEndDates(this.selectedState);
    } else if (this.selectedState == "lastmonth") {
      this.getstartEndDates(this.selectedState);
    } else if (this.selectedState == "currentquarter") {
      this.getstartEndDates(this.selectedState);
    } else if (this.selectedState == "lastquarter") {
      this.getstartEndDates(this.selectedState);
    } else if (this.selectedState == "currentyear") {
      this.getstartEndDates(this.selectedState);
    } else if (this.selectedState == "lastyear") {
      this.getstartEndDates(this.selectedState);
    } else if (this.selectedState == "custom") {
      this.disableTime = false;
      this.arsStartDate = new Date();
      this.arsEndDate = new Date();
      this.arsStartDate.setHours(0, 0, 0, 0);
      this.arsEndDate.setHours(23, 59, 59, 59);
    }
    this.minDate = this.arsStartDate;
    this.maxDate = this.arsEndDate;
  }

  getstartEndDates(duration) {
    this.tenantService.getDurationDates(duration).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      this.arsStartDate = new Date(resp.startDate);
      this.arsEndDate = new Date(resp.endDate);
      return this.arsStartDate, this.arsEndDate;
    });
  }
  getErrorMsg(msg: string) {
    return msg;
  }


}