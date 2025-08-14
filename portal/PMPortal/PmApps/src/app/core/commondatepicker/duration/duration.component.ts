import { Component, OnInit, Input } from '@angular/core';
import { TenantService } from 'src/app/PmCore/services';
import { CommonModel } from 'src/app/PmModel/common.model';
import { CommonDateModel } from 'src/app/PmModel/common-date.model';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
import { Router } from '@angular/router';
import { DatePickerHelper } from '../datepicker-helper';
import { ToastrService } from 'ngx-toastr';
import * as $ from 'jquery';
import { Duration } from '../duration.enum';
@Component({
  selector: 'app-duration',
  templateUrl: './duration.component.html',
  styleUrls: ['./duration.component.scss']
})
export class DurationComponent implements OnInit {
  public commonDateModel: CommonDateModel;
  duration;
  _globalAcc: boolean
  @Input() set allowed(globalAcc: boolean) {
    this._globalAcc = globalAcc;
    //this.changeDate();
    //console.log(this._globalAcc);
  }
  @Input() set durationChange(appDuration) {
    this.datePickerHelper._duration = appDuration;
    //this.changeDuration(appDuration);
    //console.log(this.datePickerHelper._duration);
  }
  durations: any;
  constructor(
    private router: Router,
    private tenantService: TenantService,
    public toastr: ToastrService,
    public datePickerHelper: DatePickerHelper,
    public coreService: CoreUtilityService
  ) {
    this.datePickerHelper.getDateTimeDurations().subscribe(data => {
      this.durations = data.durations;
      this.datePickerHelper._duration = this.durations[1].value;
    })
    this.commonDateModel = this.tenantService.currentDateValue;

  }

  ngOnInit() {
    console.log(Duration);
    // this.datePickerHelper._duration = this.datePickerHelper.durations.TODAY;
    //this.tenantService.currentDateValue.duration = this.duration;
  }

  applyGlobalDate() {
    // this.coreService.currentUrl = this.router.url;
    this.tenantService.currentDateValue.duration = this.datePickerHelper._duration;
    this.tenantService.currentDateValue.startDate = this.datePickerHelper.arsStartDate;
    this.tenantService.currentDateValue.endDate = this.datePickerHelper.arsEndDate;
    this.tenantService.currentDateValue.resolution = this.datePickerHelper.resolution;
    this.tenantService.currentDateValue.src = 'gdp';
    this.commonDateModel = this.tenantService.currentDateValue;
    this.tenantService.setCommonDate(this.commonDateModel);
    this.toastr.info("Date and Time changed");
    this.closeDatePicker();
  }
  closeDatePicker() {
    $('.show-tenatsdatepicker').slideToggle();
    if ($(document).width() <= 1024) {
      $('.app-content > mat-card').css('padding-top', '63px');
    } else {
      $('.app-content > mat-card').css('padding-top', '35px');
    }
  }
  changeDuration(duration) {
    //this.datePickerHelper.changeDate(duration);
    this.tenantService.currentDateValue.src = 'gdp';
  }
}
