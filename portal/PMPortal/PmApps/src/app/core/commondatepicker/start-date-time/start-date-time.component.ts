import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { CommonModel } from 'src/app/PmModel/common.model';
import { CommonDateModel } from 'src/app/PmModel/common-date.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Subject } from 'rxjs';
import { TenantService } from 'src/app/PmCore/services';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
import {DatepickerService} from '../datepicker.service'
import { DatePickerHelper } from '../datepicker-helper';
@Component({
  selector: 'app-start-date-time',
  templateUrl: './start-date-time.component.html',
  styleUrls: ['./start-date-time.component.scss']
})
export class StartDateTimeComponent implements OnInit {
  resolution: string;
  _startDate: string;
  _endDate: string;
  public commonDateModel: CommonDateModel;
  tempTime: any;
  @Input() set duration(duration: string) {
    this._duration = duration;
    if (duration == undefined) {
      return;
    } else {
      this.changeDate(duration);
    }
  }
  @Output() messageEvent = new EventEmitter<string>();
  public startAt = "month";
  public pickUp = "both";
  public myFilter;
  public myFilter1;
  public dayOf = null;
  isAuthenticate: any;
  jwtHelper = new JwtHelperService();
  isDateRangeValid: boolean = true;
  public showMonth: boolean = false;
  public disableTime: boolean;
  errorMsg: string = "";
  userDetails: any;
  dateError: string;
  _duration: string;
  maxDate: Date;
  minDate: Date;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor(
    private tenantService: TenantService,
    public coreService: CoreUtilityService,
    public dateService: DatepickerService,
    public datePickerHelper: DatePickerHelper) {
    this.userDetails = localStorage.bearerToken;
    this.isAuthenticate = this.jwtHelper.decodeToken(this.userDetails);
       }

  ngOnInit(){
    this.datePickerHelper.arsStartTime.setHours(0,0,0,0);
    this.tempTime = new Date(this.datePickerHelper.arsStartTime);
    this.maxDate = new Date();
    this.getCurrentTenant();
  }
  getCurrentTenant() {
    this.tenantService.currentTenant.subscribe(tenant => {
      if (tenant.tenantName === undefined) {
        return;
      }
      //this.tenantService.currentDateValue.startDate = this.datePickerHelper.arsStartDate;
      //this.tenantService.currentDateValue.endDate = this.datePickerHelper.arsEndDate;
      //this.tenantService.currentDateValue.startDate = this.datePickerHelper.arsStartTime;
      //this.tenantService.currentDateValue.endDate = this.datePickerHelper.arsEndTime;
      //this.tenantService.currentDateValue.duration = this.datePickerHelper._duration;
      //this.tenantService.currentDateValue.resolution = this.datePickerHelper.resolution;
      this.tenantService.currentTenantValue.userId = this.isAuthenticate.userId;
    });
  }
  startDateSelection(firstDate: any,dateTimeType) {
    //this.datePickerHelper.arsStartDate.setHours(this.datePickerHelper.arsStartTime.getHours(), this.datePickerHelper.arsStartTime.getMinutes(), this.datePickerHelper.arsStartTime.getSeconds());
    this.errorMsg = "";
    this.isDateRangeValid = true;
    let fromDate = this.coreService.convert(this.datePickerHelper.arsStartDate);
    let toDate = this.coreService.convert(this.datePickerHelper.arsEndDate);
    if(dateTimeType == 'date'){
      if(this.tempTime.getTime() != this.datePickerHelper.arsStartDate.getTime()){
        this.datePickerHelper.arsStartDate.setHours(this.tempTime.getHours(),this.tempTime.getMinutes(),this.tempTime.getSeconds());
        fromDate = this.coreService.convert(this.datePickerHelper.arsStartDate);
      }else{
        this.datePickerHelper.arsStartDate.setHours(this.tenantService.currentDateValue.startDate.getHours(),this.tenantService.currentDateValue.startDate.getMinutes(),this.tenantService.currentDateValue.startDate.getSeconds());
        fromDate = this.coreService.convert(this.datePickerHelper.arsStartDate);
      }
    }else {
     this.tempTime = new Date(this.datePickerHelper.arsStartDate);
    }
    // if(!(this.datePickerHelper.arsStartDate.getHours() > 0 && this.datePickerHelper.arsStartDate.getMinutes() > 0 && this.datePickerHelper.arsStartDate.getSeconds() > 0)){
    //   this.datePickerHelper.arsStartDate.setHours(0,0,0);
    // }
    var newStartDate = new Date(fromDate);
    var newEndDate = new Date(toDate);
    if (newStartDate > newEndDate) {
      this.coreService.dateError = "Start Date should be less than End Date";
      //this.getErrorMsg("Start date is greater than End date");
      //this._toastr.error("Start date is greater than End date");
      this.coreService.isDateRangeValid = false;
    }
    else{
      this.coreService.isDateRangeValid = true;
      this.coreService.dateError = "";
    }
    if (this._duration == 'custom') {
      this.datePickerHelper.getDefaultReportResolution(this._duration, this.datePickerHelper.arsStartDate, this.datePickerHelper.arsEndDate);
      this.resolution = this.datePickerHelper.resolution;
      this.dateService.changeMessage(this.datePickerHelper.resolution);
    }
  }

  startTimeSelection(firstTime: any){
    if (this.tenantService.currentDateValue.src == 'local') {
      firstTime = this.datePickerHelper.arsStartDate;
    }
    this.datePickerHelper.arsStartDate.setHours(firstTime.getHours(), firstTime.getMinutes(), firstTime.getSeconds());
    this.errorMsg = "";
    this.isDateRangeValid = true;
    let fromDate = this.coreService.convert(this.datePickerHelper.arsStartDate);
    let toDate = this.coreService.convert(this.datePickerHelper.arsEndDate);
    var newStartDate = new Date(fromDate);
    var newEndDate = new Date(toDate);
    if (newStartDate > newEndDate) {
      this.coreService.dateError = "Start Date should be less than End Date";
      //this.getErrorMsg("Start date is greater than End date");
      //this._toastr.error("Start date is greater than End date");
      this.coreService.isDateRangeValid = false;
    }
    else{
      this.coreService.isDateRangeValid = true;
      this.coreService.dateError = "";
    }
    if (this._duration == 'custom') {
    //this.datePickerHelper.arsStartDate = new Date(firstTime.setHours(this.datePickerHelper.arsStartTime.getHours(),this.datePickerHelper.arsStartTime.getMinutes(),this.datePickerHelper.arsStartTime.getSeconds()));
      this.datePickerHelper.getDefaultReportResolution(this.datePickerHelper._duration, this.datePickerHelper.arsStartDate, this.datePickerHelper.arsEndDate);
      this.resolution = this.datePickerHelper.resolution;
      this.dateService.changeMessage(this.datePickerHelper.resolution);
    }
  }
  changeDate(duration) {
    if (this.tenantService.currentDateValue.src == 'local') {
      this.tempTime = new Date(this.datePickerHelper.arsStartTime);
    }else{
      this.tempTime = new Date(this.datePickerHelper.arsStartTime.setHours(0,0,0,0));
    }
        //this.tempTime = new Date(this.datePickerHelper.arsStartTime.setHours(0,0,0,0));
        //this.datePickerHelper.changeDate(duration);
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
