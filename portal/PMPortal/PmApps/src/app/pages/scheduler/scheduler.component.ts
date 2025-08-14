// Angular Core
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, Data } from '@angular/router';

// Services
import { SchedulerService } from 'src/app/PmCore/services/SchedulerService/scheduler.service';
import { TenantService, UserService } from 'src/app/PmCore/services';

// Model
import { ReportUserModel } from 'src/app/PmModel/ReportUserModel';
import { ReportScheduleModel } from 'src/app/PmModel/report-schedule.model';

// Forms
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
import { RoleguardService } from 'src/app/guards/roleguard.service';
import { DeleteDialog, AppUtilService } from 'src/app/PmCore/shared/app-util.service';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from 'src/app/PmCore/services/utility.service';
import { element } from 'protractor';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.scss']
})
export class SchedulerComponent implements OnInit, OnDestroy {
  showSpinner: boolean = true;
  scheduleForm: FormGroup;
  usersList: any;
  reportList: any;
  rptUserModel: ReportUserModel = new ReportUserModel();
  rptScheduleModel: ReportScheduleModel = new ReportScheduleModel();
  reportObj: any;
  //public startDate = new Date();
  minDate: Date;
  isMailSchedule: boolean = false;
  isRepeat: boolean = false;
  inputRepeat: boolean = false;
  showHideDay: boolean = false;
  showHide: boolean = false;
  theCheckbox = false;
  theRepeatbox = false;
  duration: any;
  schDuration: any;
  selected: any;
  changeState = 'primary active';
  checkedList: any = [];
  reportFormats = [
    { value: 'HTML5', viewValue: 'HTML', selected: false },
    { value: 'PDF', viewValue: 'PDF', selected: false },
    { value: 'EXCEL', viewValue: 'EXCEL', selected: false },
    { value: 'CSV', viewValue: 'CSV', selected: false },
  ];
  timeInterval = [
    { value: "0.15", viewValue: "15 minutes" },
    { value: "0.30", viewValue: "30 minutes" },
    { value: "1", viewValue: "1 hour" },
    { value: "2", viewValue: "2 hours" },
    { value: "3", viewValue: "3 hours" },
    { value: "4", viewValue: "4 hours" },
    { value: "5", viewValue: "5 hours" },
    { value: "6", viewValue: "6 hours" },
    { value: "12", viewValue: "12 hours" }
  ];
  scheduleDurations = [
    { value: 'time', viewValue: 'Time' },
    { value: 'daily', viewValue: 'Daily' },
    { value: 'weekly', viewValue: 'Weekly' },
    { value: 'monthly', viewValue: 'Monthly' },
  ];
  days = [
    { 'value': 0, 'viewValue': 'Su', 'selected': false },
    { 'value': 1, 'viewValue': 'Mo', 'selected': false },
    { 'value': 2, 'viewValue': 'Tu', 'selected': false },
    { 'value': 3, 'viewValue': 'We', 'selected': false },
    { 'value': 4, 'viewValue': 'Th', 'selected': false },
    { 'value': 5, 'viewValue': 'Fr', 'selected': false },
    { 'value': 6, 'viewValue': 'Sa', 'selected': false }
  ];
  weeks = [
    { value: 1, viewValue: '1', selected: false },
    { value: 2, viewValue: '2', selected: false },
    { value: 3, viewValue: '3', selected: false },
    { value: 4, viewValue: '4', selected: false },
    { value: 99, viewValue: 'Last', selected: false }
  ];
  daysOfMonth = [
    { value: 1, viewValue: 'First', selected: false },
    { value: 99, viewValue: 'Last', selected: false },
    { value: 2, viewValue: '2', selected: false },
    { value: 3, viewValue: '3', selected: false },
    { value: 4, viewValue: '4', selected: false },
    { value: 5, viewValue: '5', selected: false },
    { value: 6, viewValue: '6', selected: false },
    { value: 7, viewValue: '7', selected: false },
    { value: 8, viewValue: '8', selected: false },
    { value: 9, viewValue: '9', selected: false },
    { value: 10, viewValue: '10', selected: false },
    { value: 11, viewValue: '11', selected: false },
    { value: 12, viewValue: '12', selected: false },
    { value: 13, viewValue: '13', selected: false },
    { value: 14, viewValue: '14', selected: false },
    { value: 15, viewValue: '15', selected: false },
    { value: 16, viewValue: '16', selected: false },
    { value: 17, viewValue: '17', selected: false },
    { value: 18, viewValue: '18', selected: false },
    { value: 19, viewValue: '19', selected: false },
    { value: 20, viewValue: '20', selected: false },
    { value: 21, viewValue: '21', selected: false },
    { value: 22, viewValue: '22', selected: false },
    { value: 23, viewValue: '23', selected: false },
    { value: 24, viewValue: '24', selected: false },
    { value: 25, viewValue: '25', selected: false },
    { value: 26, viewValue: '26', selected: false },
    { value: 27, viewValue: '27', selected: false },
    { value: 28, viewValue: '28', selected: false },
    { value: 29, viewValue: '29', selected: false },
    { value: 30, viewValue: '30', selected: false },
    { value: 31, viewValue: '31', selected: false },
  ];
  months = [
    { value: 1, viewValue: 'Jan', selected: false },
    { value: 2, viewValue: 'Feb', selected: false },
    { value: 3, viewValue: 'Mar', selected: false },
    { value: 4, viewValue: 'Apr', selected: false },
    { value: 5, viewValue: 'May', selected: false },
    { value: 6, viewValue: 'Jun', selected: false },
    { value: 7, viewValue: 'Jul', selected: false },
    { value: 8, viewValue: 'Aug', selected: false },
    { value: 9, viewValue: 'Sep', selected: false },
    { value: 10, viewValue: 'Oct', selected: false },
    { value: 11, viewValue: 'Nov', selected: false },
    { value: 12, viewValue: 'Dec', selected: false },
  ];
  typesOfMonthly = [
    { value: 'day', viewValue: 'Day' },
    { value: 'week', viewValue: 'Week' }
  ];
  selectedDays: any = [];
  selectedWeeks: any = [];
  selectedWeekDays: any = [];
  selectedMonths: any = [];
  scheduleObj: ReportSchedule;
  appName: string = '';
  reportName: string = '';
  title: string = 'NEW ';
  errMessage: string = '';
  isBtnLoad: boolean = false;
  isScheduleEnabled: boolean = true;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  serverTimeInfo: any;
  serverTimeZone: string = '';
  previousTenant: string;
  typeOfMonthly: string;
  bread: any;
  previousbread: string;
  previousbreadpath: any;
  constructor(
    private userService: UserService,
    public tenantService: TenantService,
    private schedulerService: SchedulerService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    public coreService: CoreUtilityService,
    private roleGaurd: RoleguardService,
    public dialog: MatDialog,
    public _utility: AppUtilService
  ) {
    this.scheduleObj = new ReportSchedule();
    this.scheduleForm = this.formBuilder.group({
      startDate: [null, [Validators.required]],
      mailContent: [''],
      emailTo: ['', Validators.compose([Validators.required, UtilityService.patternValidator(/^(\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]{2,4}\s*?,?\s*?)+$/, { haspattern: true })]),
      ],
      emailCc: [null, [UtilityService.patternValidator(/^(\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]{2,4}\s*?,?\s*?)+$/, { haspattern: true })]],
      emailBcc: [null, [UtilityService.patternValidator(/^(\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]{2,4}\s*?,?\s*?)+$/, { haspattern: true })]],
      scheduleDuration: [null],
      typeOfMonthly: [null]
    });
    this.scheduleForm.value.startDate = new Date();
    this.scheduleForm.value.typeOfMonthlyName = 'day';
  }
  get f() { return this.scheduleForm.controls; }
  ngOnInit() {
    this.showSpinner = true;
    this.route.url.subscribe(urlSegments => {
      if (urlSegments[1].path == "AdminComponent") {
        this.bread = "ManageReports";
        this.previousbread = "Admin";
        this.previousbreadpath = "home/admin";
      }
      else if (urlSegments[1].path == "Reportscheduler") {
        this.bread = "Reportschedules";
        this.previousbread = "schedulesList";
        this.previousbreadpath = "home/schedulesList";
      }
      else {
        this.bread = urlSegments[1].path;
        this.previousbread = "Apps";
        this.previousbreadpath = "home/apps";
      }
    });

    this.getTenants();
  }
  getTenants() {
    this.tenantService.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      tenant => {
        if (tenant === undefined) {
          return;
        } else if (tenant.hasOwnProperty("tenantId") && tenant.hasOwnProperty("userId")) {
          this.showSpinner = true;
          this.getScheduleDetails();
        }
        // if(this.previousTenant != undefined){
        //   if(this.tenantService.currentTenantValue.tenantName != this.coreService.previousTenant) {
        //     this.coreService.previousTenant = this.tenantService.currentTenantValue.tenantName;
        //       window.history.back();
        //       return;
        //   }
        // }else {
        //   this.previousTenant = this.tenantService.currentTenantValue.tenantName;
        //   this.coreService.previousTenant = this.tenantService.currentTenantValue.tenantName;
        // }

      }, err => {
        console.log(err);
      });
  }
  getScheduleDetails() {
    this.schedulerService.getServerTime().pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      this.serverTimeInfo = resp;
      this.serverTimeZone = 'Time is expressed in ' + resp.serverTimeInfo.DisplayName.split(' ')[0] + ' ' + resp.serverTimeInfo.StandardName;
      this.serverTimeZone = this.serverTimeZone.replace('UTC', 'GMT');
      //this.scheduleForm.controls['startDate'].setValue(this.coreService.convert(this.serverTimeInfo.serverDate));
      // this.scheduleObj.scheduleInfo.startDate = this.coreService.convert(new Date(this.serverTimeInfo.serverDate));
      console.log(this.coreService.convert(this.serverTimeInfo.serverDate));
      console.log(new Date(this.coreService.convert(this.serverTimeInfo.serverDate)));
      let dt = this.coreService.convert(this.serverTimeInfo.serverDate);
      this.scheduleForm.value.startDate = new Date(this.coreService.convert(this.serverTimeInfo.serverDate));
      this.scheduleObj.scheduleInfo.startDate = this.scheduleForm.value.startDate;
    });
    this.showSpinner = true;
    this.schDuration = this.scheduleDurations[0].value;
    this.typeOfMonthly = 'day';
    this.showOptions();
    this.minDate = new Date();
    this.rptUserModel.tenantId = this.tenantService.currentTenantValue.tenantId;
    this.rptUserModel.userId = this.tenantService.currentTenantValue.userId;
    this.rptUserModel.reportId = Number(this.route.snapshot.params.reportId);
    this.rptUserModel.scheduleId = this.route.snapshot.params.id; //this.route.queryParams.subscribe(p => p["id"]);
    this.rptUserModel.appId = this.route.snapshot.params.appId;
    this.rptUserModel.templateId = this.route.snapshot.params.templateId;
    this.scheduleObj.scheduleInfo.typeOfMonthly = 'day';
    if (this.rptUserModel.scheduleId !== undefined && this.rptUserModel.scheduleId !== '' && this.rptUserModel.scheduleId !== 'new') {
      this.title = 'EDIT ';
      this.schedulerService.getReportScheduleDetails(this.rptUserModel).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
        if (resp) {
          if (resp.status) {
            //this.toastr.error("Schedule doesn't exists");
            this.router.navigate(["/home/schedulesList"]);
            return;
          }
          this.scheduleObj = resp;
          this.isScheduleEnabled = this.scheduleObj.scheduleStatus === 'Paused' ? false : true;
          this.reportName = this.scheduleObj.reportName;
          this.appName = this.scheduleObj.appName;
          this.scheduleForm.value.startDate = this.coreService.convert(this.scheduleObj.scheduleInfo.startDate);
          this.scheduleForm.value.mailContent = this.scheduleObj.scheduleInfo.mailContent;
          this.isRepeat = this.scheduleObj.scheduleInfo.isRepeat;
          this.schDuration = this.scheduleObj.scheduleInfo.scheduleRecurrence;
          //this.scheduleObj.scheduleInfo.typeOfDay = 'day';
          if (this.schDuration == 'daily' || this.schDuration == 'weekly') {
            if (this.scheduleObj.scheduleInfo.daysOfWeek) {
              this.selectedDays.forEach((s, i) => {
                var index = -1;
                for (var j = 0; j < this.scheduleObj.scheduleInfo.daysOfWeek.length; j++) {
                  s.selected = false;
                  if (s.value == this.scheduleObj.scheduleInfo.daysOfWeek[j]) {
                    index = i;
                    break;
                  }
                }
                if (index > -1) { this.selectedDays[index].selected = true; }
              });
            }
          } else if (this.schDuration == 'time') {
            this.scheduleObj.scheduleInfo.timeInterval = this.scheduleObj.scheduleInfo.timeInterval ? this.scheduleObj.scheduleInfo.timeInterval : "0.15";
          }
          else {
            this.scheduleForm.value.typeOfMonthlyName = this.scheduleObj.scheduleInfo.typeOfMonthly;
            this.typeOfMonthly = this.scheduleObj.scheduleInfo.typeOfMonthly;
            if (this.scheduleObj.scheduleInfo.typeOfMonthly == 'day') {
              this.scheduleObj.scheduleInfo.dayOfMonth = this.scheduleObj.scheduleInfo.dayOfMonth;
              this.selectedWeekDays[0].selected = true;
              this.selectedWeeks[0].selected = true;
            } else {
              var index = this.weeks.findIndex(r => r.value === this.scheduleObj.scheduleInfo.weekOfMonth);
              if (index > -1) this.selectedWeeks[index].selected = true;
              index = this.days.findIndex(r => r.value === this.scheduleObj.scheduleInfo.dayOfWeek);
              if (index > -1) this.selectedWeekDays[index].selected = true;
            }
            this.selectedMonths.forEach((s, i) => {
              var index = -1;
              for (var j = 0; j < this.scheduleObj.scheduleInfo.months.length; j++) {
                s.selected = false;
                if (s.value == this.scheduleObj.scheduleInfo.months[j]) {
                  index = i;
                  break;
                }
              }
              if (index > -1) { this.selectedMonths[index].selected = true; }
            });
          }

          this.isMailSchedule = this.scheduleObj.scheduleInfo.isMailSchedule;
          if (this.isMailSchedule) {
            this.scheduleForm.value.emailTo = this.scheduleObj.scheduleInfo.to.join(',');
            this.scheduleForm.value.emailCc = this.scheduleObj.scheduleInfo.toCc.join(',');
            this.scheduleForm.value.emailBcc = this.scheduleObj.scheduleInfo.toBcc.join(',');
          }
        } else {
          this.toastr.error("Schedule doesn't exists");
          this.router.navigate(["/home/schedulesList"]);
        }
        this.showSpinner = false;
      });

    } else {
      this.scheduleObj.reportFormat = 'PDF';
      this.title = 'NEW ';
      this.schedulerService.getReportDetails(this.rptUserModel).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
        if (resp) {
          if (resp.status) {
            this.toastr.error(resp.message);
          } else if (resp) {
            this.scheduleObj.reportName = resp.reportName;
            this.scheduleObj.reportDescription = resp.reportDescription;
            this.scheduleObj.reportCreatedBy = resp.createdBy;

          } else {
            //this.toastr.error('Report not found for the selected Tenant');
            window.history.back();
          }
        } else {
          //this.toastr.error('Report not found for the selected Tenant');
          window.history.back();
        }
        this.showSpinner = false;
      });
    }
  }
  //commaSepEmail = (control: AbstractControl): { [key: string]: any } | null => {

  //  const emails = control.value.split(',');

  //  // tslint:disable-next-line: one-variable-per-declaration
  //  const forbidden=[] = emails.some(email => Validators.email(new FormControl(email)));
  //  // console.log(forbidden);
  //  var result = Object.keys(forbidden).map(function(key) {
  //    return [Number(key), forbidden[key]];

  //  });
  //  //console.log(result);
  //  return result ? { 'toAddress': { value: control.value } } : null;

  //};
  showEmail(e) {
    if (!this._utility.licenseInfo.emailEnabled) {
      let msgTitle = "Info";
      let msgBody = "This feature is not available in this Edition. Please contact LogicMatter at <b>support@logicmatter.com</b>";
      this._utility.warningCommonDialog(msgBody, msgTitle);
      e.target.checked = false;
      return;
    }
    this.isMailSchedule = !this.isMailSchedule;
    this.errMessage = '';
  }
  isRepeat1(e1) {
    if (!this._utility.licenseInfo.reportScheduleEnabled) {
      let msgTitle = "Info";
      let msgBody = "This feature is not available in this Edition. Please contact LogicMatter at <b>support@logicmatter.com</b>";
      this._utility.warningCommonDialog(msgBody, msgTitle);
      e1.target.checked = false;
      return;
    }
    this.isRepeat = !this.isRepeat;
    this.errMessage = '';
  }

  showOptions() {
    this.selectedDays = this.days.map(x => Object.assign({}, x));
    this.selectedMonths = this.months.map(x => Object.assign({}, x));
    this.selectedWeeks = this.weeks.map(x => Object.assign({}, x));
    this.selectedWeekDays = this.days.map(x => Object.assign({}, x));
    if (this.schDuration == 'time') {
      this.scheduleObj.scheduleInfo.timeInterval = "0.15";
    }
    else if (this.schDuration == 'daily') {
      this.selectedDays.forEach(d => d.selected = true);
      this.showHideDay = true;
      this.showHide = false;
    } else if (this.schDuration == 'weekly') {
      this.selectedDays.forEach(d => d.selected = true);
      this.checkedList = [];
      this.showHideDay = true;
      this.showHide = false;
    } else if (this.schDuration == 'monthly') {
      this.selectedMonths.forEach(m => {
        m.selected = true;
      });
      this.selectedWeekDays.forEach(dataDays => {
        dataDays.selected = false;
      });
      this.selectedWeekDays[0].selected = true;
      this.selectedWeeks[0].selected = true;
      //this.selectedWeekDays[0].selected = true;
      //this.selectedWeeks[0].selected = true;
      //this.selectedMonths[0].selected = true;
      this.showHideDay = true;
      this.showHide = true;
      this.scheduleObj.scheduleInfo.dayOfMonth = this.daysOfMonth[0].value;
    }
  }

  createSchedule(post) {
    this.isBtnLoad = true;
    this.errMessage = '';
    //if (this.title == 'NEW') {
    //  if (this.scheduleForm.controls.emailCc.invalid) { this.errMessage = 'Cc mail address is not valid'; return; }
    //  if (this.scheduleForm.controls.emailBcc.invalid) { this.errMessage = 'Bcc mail address is not valid'; return; }
    //}
    if (this.scheduleForm.value.startDate == null || this.scheduleForm.value.startDate == '') {
      this.errMessage = 'Please set the start date to begin the schedule';
      this.isBtnLoad = false;
      return;
    }

    if (!this.createScheduleDialog()) return;
    this.checkedList = [];
    if (!this.isMailSchedule) {

      if (!this.isMailSchedule && !this.isRepeat) {
        this.errMessage = 'Please select email or repeat schedule option';
        //this.toastr.error('Please select either email or repeat schedule option');
        this.isBtnLoad = false;
        return;
      }
    }
    if (this.isRepeat) {
      if (this.schDuration == 'daily') {
        this.selectedDays.forEach(dataDays => {
          if (dataDays.selected) {
            this.checkedList.push(dataDays.value);
          }
        });
        if (this.checkedList.length == 0) {
          this.errMessage = 'Please select atleast a day';
          this.isBtnLoad = false;
          return;
        }
      } else if (this.schDuration == 'weekly') {
        this.selectedDays.forEach(dataDays => {
          if (dataDays.selected) {
            this.checkedList.push(dataDays.value);
          }
        });
        if (this.checkedList.length == 0) {
          this.errMessage = 'Please select atleast a day';
          this.isBtnLoad = false;
          return;
        }
      } else if (this.schDuration == 'monthly') {
        this.scheduleObj.scheduleInfo.typeOfMonthly = this.scheduleObj.scheduleInfo.typeOfMonthly;
        this.selectedMonths.forEach(month => {
          if (month.selected) {
            this.checkedList.push(month.value);
          }
        });
        this.scheduleObj.scheduleInfo.months = this.checkedList;
        if (this.scheduleObj.scheduleInfo.typeOfMonthly == 'week') {
          this.scheduleObj.scheduleInfo.weekOfMonth = (this.selectedWeeks.find(d => (d.selected == true))) ? this.selectedWeeks.find(d => (d.selected == true)).value : 1;
          this.scheduleObj.scheduleInfo.dayOfWeek = (this.selectedWeekDays.find(d => (d.selected == true))) ? this.selectedWeekDays.find(d => (d.selected == true)).value : 1;
          if (this.scheduleObj.scheduleInfo.months.length == 0 || this.selectedWeeks.length == 0 || this.selectedWeekDays.length == 0) {
            this.errMessage = 'Select atleast a month with week and day';
            this.isBtnLoad = false;
            return;
          }
        } else {
          this.scheduleObj.scheduleInfo.weekOfMonth = 1;
          this.scheduleObj.scheduleInfo.dayOfWeek = 1;
          if (this.scheduleObj.scheduleInfo.months.length == 0) {
            this.errMessage = 'Select atleast a month with week and day';
            this.isBtnLoad = false;
            return;
          }

        }

        this.scheduleObj.scheduleInfo.recurrMonths = 1;


      }
    }
    if (this.isMailSchedule) {
      if (this.scheduleForm.value.emailTo != null || this.scheduleForm.value.emailTo != '') {
        if (this.scheduleForm.controls.emailTo.status == "INVALID") {
          this.errMessage = 'Please Provide Valid To Email id';
          this.isBtnLoad = false;
          return;
        }
        else {
          this.errMessage = '';
        }
      }
      if (this.scheduleForm.value.emailCc != null && this.scheduleForm.value.emailCc != '') {
        if (this.scheduleForm.controls.emailCc.status == "INVALID") {
          this.errMessage = 'Please Provide Valid Cc Email id';
          this.isBtnLoad = false;
          return;
        }
        else {
          this.errMessage = '';
        }
      }
      if (this.scheduleForm.value.emailBcc != null && this.scheduleForm.value.emailBcc != '') {
        if (this.scheduleForm.controls.emailBcc.status == "INVALID") {
          this.errMessage = 'Please Provide Valid bcc Email id';
          this.isBtnLoad = false;
          return;
        }
        else {
          this.errMessage = '';
        }
      }
      if (this.scheduleForm.controls["emailTo"].value instanceof Array) {
        this.scheduleObj.scheduleInfo.to = this.scheduleForm.controls["emailTo"].value;
      } else {

        this.scheduleObj.scheduleInfo.to = this.scheduleForm.controls["emailTo"].value.split(',');
      }
      if (this.scheduleForm.controls["emailCc"].value instanceof Array) {
        this.scheduleObj.scheduleInfo.toCc = this.scheduleForm.controls["emailCc"].value;
      } else {
        this.scheduleObj.scheduleInfo.toCc = this.scheduleForm.controls["emailCc"].value.split(',');
      }
      if (this.scheduleForm.controls["emailBcc"].value instanceof Array) {
        this.scheduleObj.scheduleInfo.toBcc = this.scheduleForm.controls["emailBcc"].value;
      } else {
        this.scheduleObj.scheduleInfo.toBcc = this.scheduleForm.controls["emailBcc"].value.split(',');
      }
      this.scheduleObj.scheduleInfo.to = this.scheduleObj.scheduleInfo.to.filter(v => v.trim() !== '');
      this.scheduleObj.scheduleInfo.toCc = this.scheduleObj.scheduleInfo.toCc.filter(v => v.trim() !== '');
      this.scheduleObj.scheduleInfo.toBcc = this.scheduleObj.scheduleInfo.toBcc.filter(v => v.trim() !== '');
      if (this.scheduleObj.scheduleInfo.to.length == 0) {
        this.errMessage = 'Please provide To address';
        this.isBtnLoad = false;
        return;
      }
      if (this.scheduleForm.value.emailTo != null || this.scheduleForm.value.emailTo != '') {
        if (this.scheduleForm.controls.emailTo.status == "INVALID") {
          this.errMessage = 'Please Provide Valid To Email id';
          this.isBtnLoad = false;
          return;
        }
        else {
          this.errMessage = '';
        }
      }
      if (this.scheduleForm.value.emailCc != null && this.scheduleForm.value.emailCc != '') {
        if (this.scheduleForm.controls.emailCc.status == "INVALID") {
          this.errMessage = 'Please Provide Valid Cc Email id';
          this.isBtnLoad = false;
          return;
        }
        else {
          this.errMessage = '';
        }
      }
      if (this.scheduleForm.value.emailBcc != null && this.scheduleForm.value.emailBcc != '') {
        if (this.scheduleForm.controls.emailBcc.status == "INVALID") {
          this.errMessage = 'Please Provide Valid bcc Email id';
          this.isBtnLoad = false;
          return;
        }
        else {
          this.errMessage = '';
        }
      }
      if (this.scheduleObj.scheduleInfo.to.length == 1 && this.scheduleObj.scheduleInfo.to.includes('')) {
        this.errMessage = 'Please provide To address';
        this.isBtnLoad = false;
        return;
      }
    }
    // tslint:disable-next-line: max-line-length
    this.scheduleObj.scheduleId = this.route.snapshot.params.Id == '' || this.route.snapshot.params.Id == 'new' ? '' : this.scheduleObj.scheduleId;
    this.scheduleObj.tenantId = this.tenantService.currentTenantValue.tenantId;
    this.scheduleObj.userId = this.tenantService.currentTenantValue.userId;
    this.scheduleObj.appId = this.route.snapshot.params.appId;
    this.scheduleObj.reportId = this.route.snapshot.params.reportId;
    this.scheduleObj.templateId = this.route.snapshot.params.templateId;
    this.scheduleObj.scheduleInfo.scheduleRecurrence = this.schDuration;
    this.scheduleObj.scheduleInfo.typeOfDay = 'day';
    this.scheduleObj.scheduleInfo.startDate = this.scheduleForm.value.startDate ? this.coreService.convert(this.scheduleForm.value.startDate) : this.coreService.convert(new Date().toString());
    this.scheduleObj.scheduleInfo.daysOfWeek = this.checkedList;
    this.scheduleObj.scheduleInfo.isMailSchedule = this.isMailSchedule;
    this.scheduleObj.scheduleInfo.mailContent = this.scheduleForm.value.mailContent;
    this.scheduleObj.scheduleInfo.isRepeat = this.isRepeat;
    this.schedulerService.createSchedule(this.scheduleObj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      this.isBtnLoad = false;
      if (resp.status) {
        this.toastr.error(resp.message);
      } else {
        if (this.isRepeat)
          this.toastr.success("Report Scheduled successfully");
        else
          this.toastr.success("Report shared successfully through mail");
        //this.router.navigate(["/home/schedulesList"]);
        window.history.back();
      }
    });
  }
  checkedState(evt, obj) {
    this.checkedList = [];

    if (this.schDuration == 'weekly' || this.schDuration == 'daily') {
      evt.target.classList.remove('active');
      obj.selected = !obj.selected;
      obj.selected ? evt.target.classList.add('active') : evt.target.classList.remove('active');
    } else if (this.schDuration == 'monthly') {
      if (this.scheduleObj.scheduleInfo.typeOfMonthly == 'day') {

      } else {
        var isObjSelected = !obj.selected;
        this.selectedWeekDays.forEach(dataDays => {
          dataDays.selected = false;
        });
        evt.target.classList.remove('active');
        obj.selected = isObjSelected;
        obj.selected ? evt.target.classList.add('active') : evt.target.classList.remove('active');
      }
    }
  }
  checkedWeekState(evt, weekObj) {
    var isObjSelected = !weekObj.selected;
    this.selectedWeeks.forEach(w => {
      w.selected = false;
    });
    evt.target.classList.remove('active');
    weekObj.selected = isObjSelected;
    weekObj.selected ? evt.target.classList.add('active') : evt.target.classList.remove('active');
  }
  checkedMonths(evt, monthObj) {
    evt.target.classList.remove('active');
    monthObj.selected = !monthObj.selected;
    monthObj.selected ? evt.target.classList.add('active') : evt.target.classList.remove('active');
  }
  cancel() {
    window.history.back();
  }
  removeSchedule() {
    this.schedulerService.deleteSchedule(this.rptUserModel).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      if (resp.status) {
        this.toastr.error('Error occured to remove schedule');
      } else {
        this.toastr.success('Schedule removed successfully');
        window.history.back();
      }
    });
  }
  pauseSchedule() {
    this.schedulerService.pauseSchedule(this.rptUserModel).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      if (resp.status) {
        this.toastr.error('Error occured to pause schedule');
      } else {
        this.toastr.success('Schedule has paused');
        window.history.back();
      }
    });
  }
  resumeSchedule() {
    this.schedulerService.resumeSchedule(this.rptUserModel).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      if (resp.status) {
        this.toastr.error('Error occured to resume schedule');
      } else {
        this.toastr.success('Schedule has resumed successfully');
        window.history.back();
      }
    });
  }
  removePauseScheduleDialog(evt, actionType): void {
    if (this.roleGaurd.isAuthenticate.sub === this.scheduleObj.reportCreatedBy || this.roleGaurd.isAuthenticate.roles === 'Manager') {
      const dialogRef = this.dialog.open(DeleteDialog, {
        width: "390px",
        data: { id: 0, type: '', message: 'Are you sure, you want to ' + actionType + ' this schedule of <b>' + this.scheduleObj.reportName + '</b>?', action: 'Delete', title: 'Confirmation' }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result == true) {
          if (actionType === 'remove') {
            this.removeSchedule();
          } else if (actionType === 'pause') {
            this.pauseSchedule();
          } else {
            this.resumeSchedule();
          }
        } else {
          if (actionType === 'pause' || actionType === 'enable') { evt.target.checked = this.isScheduleEnabled; }

        }
      });
    } else {
      const dialogRef = this.dialog.open(DeleteDialog, {
        width: "390px",
        data: { id: 0, type: '', message: 'You do not have permission to ' + actionType + ' the schedule.', action: 'Warning', title: 'Warning' }
      });
      if (actionType === 'pause' || actionType === 'enable') { evt.target.checked = this.isScheduleEnabled; }
    }
  }
  createScheduleDialog(): boolean {
    if ((this.roleGaurd.isAuthenticate.sub === this.scheduleObj.reportCreatedBy) || this.roleGaurd.isAuthenticate.roles === 'Manager') {
      return true;
    } else {
      this.isBtnLoad = false;
      const dialogRef = this.dialog.open(DeleteDialog, {
        width: "390px",
        data: { id: 0, type: '', message: 'You do not have permission to save/update the schedule.', action: 'Warning', title: 'Warning' }
      });
      return false;
    }
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
export class ReportSchedule {
  appId: string;
  appName: string;
  tenantId: string;
  reportFormat: string;
  templateId: string;
  reportId: number;
  reportName: string;
  reportDescription: string;
  userId: string;
  reportCreatedBy: Date;
  scheduleId: string;
  scheduleStatus: string;
  scheduleCreatedBy: string;
  scheduleCreatedOn: Date;
  scheduleModifiedBy: string;
  scheduleModifiedOn: Date;
  scheduleInfo: CronSchedule = new CronSchedule();
}
export class CronSchedule {
  isRepeat: boolean;
  isMailSchedule: boolean;
  mailContent: string;
  to: string[] = [];
  toCc: string[] = [];
  toBcc: string[] = [];
  scheduleRecurrence: string;
  startDate: string;
  endDate: string;
  daysOfWeek: number[];
  months: number[];
  recurrMonths: number;
  dayOfMonth: number;
  dayOfWeek: number;
  typeOfMonthly: string;
  typeOfDay: string;
  weekOfMonth: number;
  timeInterval: string;
}
