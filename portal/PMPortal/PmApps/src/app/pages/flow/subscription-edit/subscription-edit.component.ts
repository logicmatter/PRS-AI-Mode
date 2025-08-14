import { Component, OnDestroy, OnInit, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router  } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FlowService } from '../../../PmCore/services/FlowService/flow.service';
import { TenantService } from '../../../PmCore/services/TenantService/TenantService.service';
import { CommonModel } from '../../../PmModel/common.model';
import { Datasource, DataFlow } from '../../../PmModel/datasource';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-subscription-edit',
  templateUrl: './subscription-edit.component.html',
  styleUrls: ['./subscription-edit.component.scss']
})
export class SubscriptionEditComponent implements OnInit, OnDestroy {
  ngUnsubscribe: Subject<void> = new Subject<void>();
  dataSourceId: number;
  flowType: string;
  tenants: CommonModel;
  datasourceModel: Datasource = new Datasource();
  dataFlowModel: DataFlow = new DataFlow();
  video: string;
    showLoadButton: boolean;

  constructor(
    private _route: ActivatedRoute,
    private _service: FlowService,
    private _configService: TenantService,
    private location: Location,
    private _toastrService: ToastrService,
    private _router: Router,
  ) { }

  ngOnInit() {
    this.dataSourceId = +this._route.snapshot.paramMap.get('subscriptionId');

    this.flowType = this._route.snapshot.paramMap.get('flowType');
    this.getTenants();

  }

  getTenants() {
    this._configService.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      tenant => {
        this.tenants = tenant;
        if (tenant.tenantId === undefined) {
          return;
        } else if (!tenant.hasOwnProperty("tenantId") || !tenant.hasOwnProperty("userId")) {
          return;
        } else {
          if (this.flowType == 'dataFlow') {
            this._service.getDataFlowById(this.dataSourceId, this.tenants.tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
              this.dataFlowModel = resp[0];
              this.video = this.dataFlowModel.templateEmbedUrl + "&widget=false&chrome=false";
            });
          } else if(this.flowType == 'spreadSheet'){
            this._service.getDatasourceById(this.dataSourceId, this.tenants.tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
              this.datasourceModel = resp[0];
              this.video = this.datasourceModel.sourceGoogleSheetId + "&widget=false&chrome=false";
            });

          } else  {
            this._service.getDatasourceById(this.dataSourceId, this.tenants.tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
              this.datasourceModel = resp[0];
              this.video = this.datasourceModel.templateEmbedUrl + "&widget=false&chrome=false";
            });

          }
        }
      },
       err => {
        console.log(err);
      });


  }


  downloadSubscription() {
    this.showLoadButton = true;
    this._service.saveSubscriptionTemplate(this.dataSourceId, this.tenants.tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      if (resp) {
        this._toastrService.success("Subscription saved to Server");
        this.showLoadButton = false;
      }
    }, err => {
        this._toastrService.error("Subscription failed to save in Server");
        this.showLoadButton = false;
    });
  }

  // navigate() {
  //   this.location.back();
  // }
  navigate1(): void {
    this._router.navigate(['/home/flow/data-source-detail/' + this.dataSourceId]);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
