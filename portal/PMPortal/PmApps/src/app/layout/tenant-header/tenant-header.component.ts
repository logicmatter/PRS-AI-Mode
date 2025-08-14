import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { TenantService } from 'src/app/PmCore/services';
import { AppUtilService } from 'src/app/PmCore/shared/app-util.service';
import { CommonModel } from 'src/app/PmModel/common.model';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
@Component({
  selector: 'app-tenant-header',
  templateUrl: './tenant-header.component.html',
  styleUrls: ['./tenant-header.component.scss']
})
export class TenantHeaderComponent implements OnInit {
  tenants: any = [];
  tenantId: string;
  userDetails: any;
  isAuthorized: any;
  tenantLoadMessage: string = 'Loading..... Tenant';
  helper = new JwtHelperService();
  public commonModel: CommonModel;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor(
    public _utility: AppUtilService,
    private tenantService: TenantService,
    private toastrService: ToastrService,
    private route: Router) {
    this.commonModel = new CommonModel();
    this.userDetails = localStorage.bearerToken;
    this.isAuthorized = this.helper.decodeToken(this.userDetails);
  }

  ngOnInit() {
    this.getTenantService();
    this.tenantService.tenantSelected.subscribe((obj: any) => {
      this.getTenantService();
    });
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
            if (this.route.url.includes("home-dashboard") || this.route.url.includes("tDashboard")) {
              this.route.navigate(['/tDashboard', this.commonModel.tenantId]);
            }
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
          this._utility.tenants = resp;
          this._utility.tenantId = this._utility.tenants[0];
          if (this.route.url.includes("home-dashboard") == true) {
            this._utility.tenantId = "default";
            localStorage.setItem('mastertenant', 'true');
          }
          else {
            this._utility.HomeSelecttenant = 'tenant'
            if (this._utility.HomeSelecttenant !== "default") {
              this._utility.tenantId = this._utility.tenants[0];
            } else {
              console.log("Selected tenant is default");
            }

          }

        }
        this.commonModel.tenantId = resp[0].id;
        this.commonModel.tenantName = this._utility.tenants[0].tenantName;
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

  setTenantId(newTenantId: string) {
    this._utility.tenantId = newTenantId;
  }


  compareFn(t1: any, t2: any): boolean {
    return t1 && t2 ? t1.tenantName === t2.tenantName : t1 === t2;
  }
}