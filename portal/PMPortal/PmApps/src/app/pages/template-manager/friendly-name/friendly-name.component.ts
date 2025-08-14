import { Component, OnInit } from '@angular/core';
import { CommonModel } from 'src/app/PmModel/common.model';
import { TenantService } from 'src/app/PmCore/services';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TenantConfigModel } from 'src/app/PmModel/TenantConfigModel';
import { WebsiteService } from 'src/app/PmCore/services';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-friendly-name',
  templateUrl: './friendly-name.component.html',
  styleUrls: ['./friendly-name.component.scss']
})
export class FriendlyNameComponent implements OnInit {

  public commonModel: CommonModel;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  tenants: unknown;
  tenantConfig : TenantConfigModel;
  TenantFriendlyName : string;

  constructor(
    private tenantService: TenantService,
    public websiteService: WebsiteService,
    private toastr: ToastrService,
    private location: Location,
    private router: Router
  ) { }

  ngOnInit() {
    this.tenantConfig = new TenantConfigModel();
  }

  
  updateValue() {
    this.tenantConfig.Id = this.tenantService.currentTenantValue.tenantId
    this.tenantConfig.TenantName = this.tenantService.currentTenantValue.tenantName
    this.tenantConfig.TenantFriendlyName = this.TenantFriendlyName
    this.websiteService.SaveTenantFriendlyDetails(this.tenantConfig).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
    }, err => {
      if(err.status == 200)
      {
        this.toastr.success('Updated the Tenant Friendly Name Successfully');
        setTimeout(() => {
        window.location.reload();
        this.router.navigateByUrl('/refresh', { skipLocationChange: true }).then(() => {
        this.router.navigate([this.router.url]);
        });
      }, 400);
        
      }
      else if(err.status == 500)
      {
        this.toastr.error("Tenant Friendly Name already exists");
      }
      else
      {
        this.toastr.error(" Failed to Updated the Tenant Friendly Name");
      }
    });
  }
}
