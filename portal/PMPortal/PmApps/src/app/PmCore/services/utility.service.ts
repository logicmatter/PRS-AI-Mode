
import { takeUntil, filter, pairwise } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { SubscriptionLike as ISubscription, range, Observable, Subject } from 'rxjs';
import { Router, RoutesRecognized } from '@angular/router';
import { AdhocReporting } from '../../PmModel/adhoc-reporting';
import { Search } from 'src/app/PmModel/search.model';
import { ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  routerValue: boolean = true;
  isDisabled: boolean;
  dealer: any;
  tenant: any;
  tenants: any;
  selectedTenantInfo: any;
  pageRange: any;
  testRange: any;
  haspages: boolean = true;
  presentPageNo = 1;
  totalPageNo = null;
  newPage: number = 1;
  showSpinner: boolean;
  subscription: ISubscription;
  selectedAppId: any;
  reportInnerHtml: string = '';
  rptObj: any;
  userDetails: any;
  getUrl: any;
  userActivityInfo: any;
  checkedList: any;
  saveFilter: any;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  public reportParams: AdhocReporting = new AdhocReporting();
  public searchModel: Search = new Search();
  isDisable: boolean = false;
  isDisablefirst: boolean = false;
  isDisablefirstpre: boolean = false;
  isDisablelast: boolean = false;
  isDisablelastnxt: boolean = false;
  salesList: any;
  maxRecords: any = '10';
  config: any;
  entitySelected: any;
  userName: string;
  selectedDateState: any;
  //daterange variables
  durationType: string;
  adhocChart: any;
  adhocDurationChg: boolean = false;
  adhocDurationDesc: string;
  adhocDataDesc: string;
  adhocShowSpinner: boolean;
  adhocglobalStartDate: string;
  adhocglobalEndDate: string;
  adhocglobalDuration: string;
  adhocPreviousRoute: string;
  paramSid: any;
  paramDevNum: any;
  status:boolean = false;
  pattern = new RegExp('[!*?]');
  patternShow: boolean = false;
  patternInfo: string;
  maxDateCalendar: any;
  selectedTenantName: any;
  objectTypes: any;
  constructor(
    private router: Router
  ) {
    router.events
      .pipe(
        filter(event => event instanceof RoutesRecognized),
        pairwise()
      )
      .subscribe((e: any) => {
        this.adhocPreviousRoute = e[0].urlAfterRedirects;
        console.log(this.adhocPreviousRoute);
      });
    this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
    this.config = {
      'currentPage': 1,
      'itemsPerPage': 10
    };
  }

  convert(str) {
    var date = new Date(str),
      month = ('0' + (date.getMonth() + 1)).slice(-2),
      day = ('0' + date.getDate()).slice(-2),
      hours = ('0' + date.getHours()).slice(-2),
      minutes = ('0' + date.getMinutes()).slice(-2),
      seconds = ('0' + date.getSeconds()).slice(-2);

    var mySQLDate = [date.getFullYear(), month, day].join('-');
    var mySQLTime = [hours, minutes, seconds].join(':');
    return [mySQLDate, mySQLTime].join(' ');
  }

  convert1(str) {
    var date = new Date(str),
      month = ('0' + (date.getMonth() + 1)).slice(-2),
      day = ('0' + date.getDate()).slice(-2),
      hours = ('0' + date.getHours()).slice(-2),
      minutes = ('0' + date.getMinutes()).slice(-2),
      seconds = ('0' + date.getSeconds()).slice(-2);

    var mySQLDate = [month,day,date.getFullYear()].join('/');
    var mySQLTime = [hours, minutes, seconds].join(':');
    return [mySQLDate, mySQLTime].join(' ');
  }

  setPage() {
    this.presentPageNo = 1;
    var d = this.reportInnerHtml;
    var da = new DOMParser();
    var p = da.parseFromString(d, 'text/html');
    var pageNum = p.querySelector('[TITLE=\'page_number\']');
    if (pageNum !== null) {
      var pages: number[] = pageNum.textContent.match(/\d+/g).map(Number);
      this.haspages = false;
      this.presentPageNo = pages[0];
      this.totalPageNo = pages[1];
      this.isDisable = false;
      this.isDisablefirst = false;
      this.isDisablefirstpre = false;
      this.isDisablelast = false;
      this.isDisablelastnxt = false;
      if ((this.presentPageNo > 1) && (this.presentPageNo <= this.totalPageNo)) {
        this.isDisable = true;
        this.isDisablefirst = true;
        this.isDisablefirstpre = true;
        this.isDisablelast = true;
        this.isDisablelastnxt = true;
      }
      if (this.presentPageNo == this.totalPageNo) {
        this.isDisable = true;
        this.isDisablelast = false;
        this.isDisablelastnxt = false;
      }
      if (this.presentPageNo == 1) {
        this.isDisable = true;
        this.isDisablelast = true;
        this.isDisablelastnxt = true;
      }
      if (this.totalPageNo == 1) {
        this.isDisable = false;
        this.isDisablelast = false;
        this.isDisablelastnxt = false;
      }
      this.pageRange = range(1, this.totalPageNo)
      this.testRange = this.pageRange.subscribe(val => {
        this.pageRange = val
      }
      );
    }
    else {
      this.haspages = true;
    }
  }
  static patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        // if control is empty return no error
        return null;
      }

      // test the value of the control against the regexp supplied
      const valid = regex.test(control.value);

      // if true, return no error (no error), else return error passed in the second parameter
      return valid ? null : error;
    };
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

  }

}
