import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { UserService } from './../../../PmCore/services/UserService/UserService.service';
import { TenantService } from './../../../PmCore/services/TenantService/TenantService.service';
import { ReportUserModel } from 'src/app/PmModel/ReportUserModel';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModel } from 'src/app/PmModel/common.model';
import { CoreUtilityService } from 'src/app/PmCore/shared/core-utility.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-admin-report-users',
  templateUrl: './report-users.component.html',
  styleUrls: ['./report-users.component.scss']
})
export class ReportUsersComponent implements OnInit, OnDestroy, AfterViewInit {
  user: any = {
    'firstName': '',
    'lastName': '',
    'email': '',
    'isActive': ''
  };
  usersList = [];
  reportObj: any = {
    reportName: '',
    reportDescription: '',
    createdBy: '',
    createdOn: '',
  };
  key: string;
  reverse: boolean;
  previousTenant: any;
  tempUsersList: any = [];
  sort(key: string) {
    if (key !== '') {
      this.key = key;
      this.reverse = !this.reverse;
    }
  }
  showSpinner: boolean = true;
  rptUserModel: ReportUserModel = new ReportUserModel();
  ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor(
    private userService: UserService,
    public tenantService: TenantService,
    private route: ActivatedRoute,
    public coreService: CoreUtilityService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
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
          this.rptUserModel.tenantId = this.tenantService.currentTenantValue.tenantId;
          this.rptUserModel.appId = data['appId'];
          this.rptUserModel.reportId = data['rptId'];
          this.geUserAccessReports();
        });
      });
  }
  geUserAccessReports() {
    this.showSpinner = true;
    this.userService.getReportUsersList(this.rptUserModel).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      if (resp) {
        this.reportObj = resp == null ? this.reportObj : resp;
        this.usersList = (resp == null) ? [] : (resp.users == null) ? [] : resp.users;
        this.tempUsersList = (resp == null) ? [] : (resp.users == null) ? [] : resp.users;
        this.showSpinner = false;
        this.reverse = true;
        this.sort(this.key);
      } else {
        this.toastr.error("Report doesn't exists");
        window.history.back();
      }
    }, err => {
      this.toastr.error("Something went wrong to fetch Users");
      window.history.back();
    });
  }
  checkAssign(usr) {
    usr.hasAccess = !usr.hasAccess;
  }
  updateAssignReportUsers() {
    // if (this.tempUsersList === this.usersList) {
    //   this.toastr.warning("Please select a User");
    //   return;
    // }
    this.showSpinner = true;
    this.reportObj.users = this.usersList;
    this.userService.updateAssignedUsers({ 'reportObj': this.reportObj, 'tenantId': this.tenantService.currentTenantValue.tenantId }).subscribe(resp => {
      this.toastr.success("Report assigned successfully");
      window.history.back();
    }, err => {
      this.showSpinner = false;
      this.toastr.error("Something went wrong to assign users");
    });
  }

  filterByReportOwner(reportObj) {
    return this.usersList.filter(x => (x.email !== reportObj.createdBy));
  }
  cancel() {
    window.history.back();
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
