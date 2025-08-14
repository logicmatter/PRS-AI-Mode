import { StartDateTimeComponent } from './../start-date-time/start-date-time.component';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CommonModel } from 'src/app/PmModel/common.model';
import { CommonDateModel } from 'src/app/PmModel/common-date.model';
import { TenantService } from 'src/app/PmCore/services';
import { JwtHelperService } from '@auth0/angular-jwt';
import { DatepickerService } from '../datepicker.service';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
import { DatePickerHelper } from '../datepicker-helper';
@Component({
  selector: 'app-resolution',
  templateUrl: './resolution.component.html',
  styleUrls: ['./resolution.component.scss']
})
export class ResolutionComponent implements OnInit {
  _duration: string;
  _src: string;
  public commonModel: CommonModel;
  public commonDateModel: CommonDateModel;
  userDetails: any;
  isAuthenticate: any;
  jwtHelper = new JwtHelperService();
  key: string;
  reverse: boolean;
  @Input() set duration(duration: string) {
    this.datePickerHelper.changeDate(duration);
  }

  resolution: any;
  resolutions = [
    { value: 'actual', viewValue: 'Actual' },
    { value: 'hourly', viewValue: 'Hourly' },
    { value: 'daily', viewValue: 'Daily' },
    { value: 'weekly', viewValue: 'Weekly' },
    { value: 'monthly', viewValue: 'Monthly' },
    { value: 'quarterly', viewValue: 'Quarterly' },
    { value: 'yearly', viewValue: 'Yearly' }
  ];
  sort(key: string) {
    if (key !== '') {
      this.key = key;
      this.reverse = !this.reverse;
    }
  }
  constructor(private tenantService: TenantService,
              public coreService: CoreUtilityService,
              public dateService: DatepickerService,
              public datePickerHelper: DatePickerHelper) {
    this.userDetails = localStorage.bearerToken;
    this.isAuthenticate = this.jwtHelper.decodeToken(this.userDetails);
   }

  ngOnInit() {
    this.datePickerHelper.resolution = this.coreService.resolutions.length > 0 ? this.coreService.resolutions[0].value : this.datePickerHelper.resolution;
    this.getCurrentTenant();
  }
  getCurrentTenant() {
    this.tenantService.currentTenant.subscribe(tenant => {
      if (tenant.tenantName === undefined) {
        return;
      }
      if (this.commonModel == undefined && this.commonDateModel == undefined) {
        return;
      } else {
        this.tenantService.currentDateValue.startDate = this.datePickerHelper.arsStartDate;
        this.tenantService.currentDateValue.endDate = this.datePickerHelper.arsEndDate;
        this.tenantService.currentDateValue.startDate = this.datePickerHelper.arsStartTime;
        this.tenantService.currentDateValue.endDate = this.datePickerHelper.arsEndTime;
        this.tenantService.currentDateValue.duration = this.datePickerHelper._duration;
        this.tenantService.currentTenantValue.userId = this.isAuthenticate.userId;
        this.tenantService.currentDateValue.resolution = this.datePickerHelper.resolution;
      }
    });
  }
  getResolutions(duration) {
    this.datePickerHelper.getDefaultReportResolution(duration, this.datePickerHelper.arsEndDate, this.datePickerHelper.arsEndDate);
  }

  receiveMessage($event) {
    this.datePickerHelper.resolution = $event
  }
  changeResolution(resol){
    this.datePickerHelper.resolution = resol;
  }
}
