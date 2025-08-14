import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TenantService } from 'src/app/PmCore/services';
import { UtilityService } from 'src/app/PmCore/services/utility.service';
import { AppUtilService } from 'src/app/PmCore/shared/app-util.service';
import { CommonModel } from 'src/app/PmModel/common.model';
import { ToolbarComponent } from 'src/app/layout';

@Component({
  selector: 'app-flow-dashboard',
  templateUrl: './flow-dashboard.component.html',
  styleUrls: ['./flow-dashboard.component.scss']
})
export class FlowDashboardComponent implements OnInit {
  flowTiles: any[];
  tenants: any = [];
  tenantId: string;
  isAuthorized: any;
  helper = new JwtHelperService();
  userDetails: any;
  public commonModel: CommonModel;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  lic: any;
  constructor(
    private _router: Router,
    private _utility: AppUtilService,
    public tenantService: TenantService,
    private toastrService: ToastrService,
    public utility: UtilityService,
    public _toolbar: ToolbarComponent,
  ) {
    this.commonModel = new CommonModel();
    this.userDetails = localStorage.bearerToken;
    this.isAuthorized = this.helper.decodeToken(this.userDetails);
    this.flowTiles = [];

    if (this._utility.lic === undefined) {
      this.tenantService.getLicenseInfo().pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
        this.lic = resp.domain;
        this.setFlowTilesBasedOnLicense();
      });
    } else {
      this.lic = this._utility.lic;
      this.setFlowTilesBasedOnLicense();
    }

  }

  setFlowTilesBasedOnLicense() {
    this.flowTiles = [
      {
        imageUrl: 'assets/images/datasource3.png',
        tileName: 'Data Sources',
        description: 'Configure Datasources to pull data from Source',
        index: 0,
        route: '/home/flow/data-source-list'
      },
      {
        imageUrl: 'assets/images/etl3.png',
        tileName: 'Data Flow',
        description: 'Import, Transform & Export Datasources',
        index: 0,
        route: '/home/flow/Transformers'
      }
    ];

    if (this.lic === "BMS") {
      this.flowTiles.push(
        {
          imageUrl: 'assets/images/gateway3.png',
          tileName: 'Gateway Sources',
          description: 'Gateway Compass Data Sources',
          index: 0,
          route: '/home/flow/Gateway'
        }
      );
    }

  }

  ngOnInit() {
    var mastertenantValue = localStorage.getItem('mastertenant');
    if (mastertenantValue == "true") {
      localStorage.setItem('mastertenant', 'false');
      this.tenantService.triggerTenantSelected(this._utility.tenantId);
    }
    this._toolbar.enablebutton();
    this.utility.entitySelected = "Reports";
    localStorage.selectedTabIndex = 0;
    this.getTenantService();
  }
  getTenantService() {
    //this.tenantLoadMessage ='Loading..... Tenant';
    this.tenantService.getAllTenants(this.isAuthorized.userId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      if (resp) {
        //console.log(this._utility.)
        console.log(this.tenantService.currentTenantValue)

        resp.forEach(element => {
          if (element == this.tenantService.currentTenantValue) {
            this.tenants = resp;
            this.commonModel.tenantId = this.tenantService.currentTenantValue.tenantId
            this.commonModel.tenantName = this.tenantService.currentTenantValue.tenantName
            this.tenantService.setData(this.commonModel);
          }
          else {
            return
          }
        });
      } else {
        // this.tenantLoadMessage ='No Tenant configured';
        this.toastrService.error("No Tenant configured");
      }
    }, err => {
      //this.tenantLoadMessage ='Failed to fetch Tenant';
      this.toastrService.error("Error: Something went wrong. Failed to fetch Tenant");
    });

  }
  onClickTile(obj): void {
    if (obj.tileName == "Data Sources") {
      //this._router.navigateByUrl('../data-source-list');
      this._router.navigate(['../data-source-list/']);
    } else if (obj.tileName == "Import Flow") {
      this._router.navigate(['/flow-edit/', '1']);
    } else if (obj.tileName == "Data Lake") {
      this._router.navigate(['/flow-edit/', '1']);
    }

  }

}
