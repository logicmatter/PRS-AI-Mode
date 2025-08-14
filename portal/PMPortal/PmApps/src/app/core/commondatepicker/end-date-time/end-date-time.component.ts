import { Component, OnInit, Input } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TenantService } from 'src/app/PmCore/services';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
import { CommonModel } from 'src/app/PmModel/common.model';
import { CommonDateModel } from 'src/app/PmModel/common-date.model';
import { DatePickerHelper } from '../datepicker-helper';
import { DatepickerService } from '../datepicker.service';
@Component({
  selector: 'app-end-date-time',
  templateUrl: './end-date-time.component.html',
  styleUrls: ['./end-date-time.component.scss']
})
export class EndDateTimeComponent implements OnInit {
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
      this.changeDate(this._duration);
    }
  }
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
    public datePickerHelper: DatePickerHelper,
    public dateService: DatepickerService) {
    this.userDetails = localStorage.bearerToken;
    this.isAuthenticate = this.jwtHelper.decodeToken(this.userDetails);
       }

  ngOnInit(){
    this.datePickerHelper.arsEndDate;
    this.tempTime = new Date(this.datePickerHelper.arsEndDate);
    this.maxDate = new Date();
    //this.getCurrentTenant();
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
      //this.tenantService.currentDateValue.duration = this._duration;
      this.tenantService.currentTenantValue.userId = this.isAuthenticate.userId;
    });
  }


  changeDate(duration) {
    if (this.tenantService.currentDateValue.src == 'local') {
      this.tempTime = new Date(this.datePickerHelper.arsEndTime);
    }else{
      this.tempTime = new Date(this.datePickerHelper.arsEndTime);
    }
    //this.datePickerHelper.changeDate(duration);
  }
  endDateSelection(lastDate: any, dateTimeType) {
    //this.datePickerHelper.arsEndDate.setHours(this.datePickerHelper.arsEndTime.getHours(),this.datePickerHelper.arsEndTime.getMinutes(),this.datePickerHelper.arsEndTime.getSeconds()));
    this.errorMsg = "";
    this.isDateRangeValid = true;
    let fromDate = this.coreService.convert(this.datePickerHelper.arsStartDate);
    let toDate = this.coreService.convert(this.datePickerHelper.arsEndDate);
    if(dateTimeType == 'date'){
      if(this.tempTime.getTime() != this.datePickerHelper.arsEndDate.getTime()){
        this.datePickerHelper.arsEndDate.setHours(this.tempTime.getHours(),this.tempTime.getMinutes(),this.tempTime.getSeconds());
        toDate = this.coreService.convert(this.datePickerHelper.arsEndDate);
      }else{
        this.datePickerHelper.arsEndDate.setHours(this.tenantService.currentDateValue.endDate.getHours(),this.tenantService.currentDateValue.endDate.getMinutes(),this.tenantService.currentDateValue.endDate.getSeconds());
        toDate = this.coreService.convert(this.datePickerHelper.arsEndDate);
      }
    }else {
     this.tempTime = new Date(this.datePickerHelper.arsEndDate);
    }
    // if(!(this.datePickerHelper.arsEndDate.getHours() > 0 && this.datePickerHelper.arsEndDate.getMinutes() > 0 && this.datePickerHelper.arsEndDate.getSeconds() > 0)){
    //   this.datePickerHelper.arsEndDate.setHours(23,59,59);
    // }
    var newStartDate = new Date(fromDate);
    var newEndDate = new Date(toDate);
    if (newEndDate < newStartDate) {
      this.coreService.dateError = "Start Date should be less than End Date";
      //this.getErrorMsg("End date is less than Start Date");
      //this._toastr.error("End date is less than Start Date");
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
  endTimeSelection(lastTime: any){
    if (this.tenantService.currentDateValue.src == 'local') {
      lastTime = this.datePickerHelper.arsEndDate;
    }
    this.datePickerHelper.arsEndDate.setHours(lastTime.getHours(), lastTime.getMinutes(), lastTime.getSeconds());
    this.errorMsg = "";
    this.isDateRangeValid = true;
    let fromDate = this.coreService.convert(this.datePickerHelper.arsStartDate);
    let toDate = this.coreService.convert(this.datePickerHelper.arsEndDate);
    var newStartDate = new Date(fromDate);
    var newEndDate = new Date(toDate);
    if (newEndDate < newStartDate) {
      this.coreService.dateError = "Start Date should be less than End Date";
      //this.getErrorMsg("End date is less than Start Date");
      //this._toastr.error("End date is less than Start Date");
      this.coreService.isDateRangeValid = false;
    }
    else{
      this.coreService.isDateRangeValid = true;
      this.coreService.dateError = "";
    }
    if (this._duration == 'custom') {
//      this.datePickerHelper.arsEndDate = new Date(lastTime.setHours(this.datePickerHelper.arsEndTime.getHours(), this.datePickerHelper.arsEndTime.getMinutes(), this.datePickerHelper.arsEndTime.getSeconds()));
      this.datePickerHelper.getDefaultReportResolution(this.datePickerHelper._duration, this.datePickerHelper.arsStartDate, this.datePickerHelper.arsEndDate);

      this.resolution = this.datePickerHelper.resolution;
      this.dateService.changeMessage(this.datePickerHelper.resolution);
    }
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
