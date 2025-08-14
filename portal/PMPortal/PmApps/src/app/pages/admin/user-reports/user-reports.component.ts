// Angular Core / Angular Router
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

// Services
import { UserService } from './../../../PmCore/services/UserService/UserService.service';
import { TenantService } from './../../../PmCore/services/TenantService/TenantService.service';
import { CoreUtilityService } from './../../../PmCore/shared/core-utility.service';

// Models
import { ReportUserModel } from 'src/app/PmModel/ReportUserModel';
import { CommonModel } from 'src/app/PmModel/common.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from 'src/app/PmCore/services/utility.service';
@Component({
  selector: 'app-admin-user-reports',
  templateUrl: './user-reports.component.html',
  styleUrls: ['./user-reports.component.scss']
})
export class UserReportsComponent implements OnInit, AfterViewInit {
  userObj: any = {
    firstName: '',
    lastName: '',
    email: '',
    isActive: '',
    roles: 'User'
  };
  usersReportsObj: any = {
    firstName: '',
    lastName: '',
    email: '',
  };
  key: string;
  reverse: boolean;

  sort(key: string) {
    if (key !== '') {
      this.key = key;
      this.reverse = !this.reverse;
    }
  }
  reportsList = [];
  rptUserModel: ReportUserModel = new ReportUserModel();
  showSpinner: boolean = true;
  previousTenant: any;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor(private userService: UserService, public tenantService: TenantService, private toastr: ToastrService,
    private route: ActivatedRoute, private router: Router, public coreService: CoreUtilityService, private utility: UtilityService) { }

  ngOnInit() {
    this.userObj.roles = this.userService.getLoginUserRoles();
    this.getTenants();
  }
  ngAfterViewInit() {
  }
  getTenants() {
    this.tenantService.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      tenant => {
        if (tenant === undefined) {
          return;
        } else if (!tenant.hasOwnProperty("tenantId") || !tenant.hasOwnProperty("userId")) {
          return;
        }
        if (this.previousTenant != undefined) {
          if (this.tenantService.currentTenantValue.tenantName != this.coreService.previousTenant) {
            this.coreService.previousTenant = this.tenantService.currentTenantValue.tenantName;
            window.history.back();
            return;
          }
        } else {
          this.previousTenant = this.tenantService.currentTenantValue.tenantName;
          this.coreService.previousTenant = this.tenantService.currentTenantValue.tenantName;
        }
        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.getUserAccessReports(data['id']);
        });
      });
  }
  getUserAccessReports(userId) {
    this.reportsList = [];
    this.showSpinner = true;
    this.rptUserModel.reportType = this.utility.entitySelected == 'All' || 'Reports' || 'Device' || 'Energy Log' || 'Alarm' || 'Points' || 'Transformer' ? 'Report' : 'Transformer';
    this.rptUserModel.tenantId = this.tenantService.currentTenantValue.tenantId;
    this.rptUserModel.userId = userId;
    this.userService.getUserReportsList(this.rptUserModel).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      if (resp) {
        this.userObj.roles = (resp == null) ? '' : resp.roles[0];
        this.usersReportsObj = (resp == null) ? this.usersReportsObj : resp;
        this.reportsList = (resp == null) ? [] : (resp.userReports == null) ? [] : resp.userReports;
        this.showSpinner = false;
        this.reverse = true;
        this.sort(this.key);
      } else {
        this.toastr.error("Reports not found");
        this.reportsList = [];
        window.history.back();
      }
    }, err => {
      this.toastr.error("Something went wrong to fetch reports");
      window.history.back();
    });
  }
  checkAssign(rpt) {
    rpt.isAssigned = !rpt.isAssigned;
  }
  updateAssignReports() {
    this.usersReportsObj.userReports = this.reportsList;
    this.userService.updateAssignedReports({ 'userObj': this.usersReportsObj, 'tenantId': this.tenantService.currentTenantValue.tenantId }).subscribe(resp => {
      this.toastr.success("Reports assigned successfully");
      window.history.back();
    }, err => {
      this.toastr.error("Something went wrong to assign reports");
      window.history.back();
    });
  }

  schedule(rpt) {
    this.showSpinner = true;
    if (rpt.scheduleId == null || rpt.scheduleId == '' || rpt.scheduleId == undefined) { rpt.scheduleId = 'new' }
    this.router.navigateByUrl("/home/scheduler/" + rpt.appId + "/" + rpt.templateId + "/" + rpt.reportId + "/" + rpt.scheduleId);
  }
  cancel() {
    window.history.back();
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
