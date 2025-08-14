import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModel } from 'src/app/PmModel/common.model';
import { ConfirmationDialogComponent } from '../../core/confirmation-dialog/confirmation-dialog.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// Models
import { DialogModel } from '../../PmModel/dialog.model';
// Services
import { TenantService } from '../../PmCore/services/TenantService/TenantService.service';
import { AppUtilService } from 'src/app/PmCore/shared/app-util.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UtilityService } from 'src/app/PmCore/services/utility.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss']
})
export class MarketplaceComponent implements OnInit {
  // @ViewChild('appDialog') appDialog: ConfirmationDialogComponent;
  public commonModel: CommonModel;
  public dialogModel: DialogModel;
  userDetails: any;
   tenantLoadMessage: string='Loading..... Tenant';
  helper = new JwtHelperService();
   isAuthorized: any;
   ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor(
    private _utility: AppUtilService,
    private tenantService: TenantService,
    public utility: UtilityService,
    private dialog: MatDialog) {

      this.userDetails = localStorage.bearerToken;
    this.isAuthorized = this.helper.decodeToken(this.userDetails);
    }

  ngOnInit() {
    this._utility.showSpinner = false;
    this.commonModel= this.tenantService.currentTenantValue;
    console.log(this.commonModel);
    if(this.utility.adhocPreviousRoute != undefined) {
      this.commonModel = new CommonModel();
      this.tenantService.getAllTenants(this.isAuthorized.userId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
        if(resp){
          if (resp==resp[1]) {
            this._utility.tenants = resp;
            this._utility.tenantId = this._utility.tenants[1];
          }
          this.commonModel.tenantId = this._utility.tenantID;;
          this.commonModel.tenantName = this._utility.previousTenant;
          this.tenantService.setData(this.commonModel);
          this._utility.previousTenant = this.tenantService.currentTenantValue.tenantName;
          this._utility.tenantID = this.commonModel.tenantId;
        
      }else{
        this.tenantLoadMessage ='No Tenant configured';
      }
      }, err => {
        this.tenantLoadMessage ='Failed to fetch Tenant';
      });
    }
    // this.dialogModel.title = 'MarketPlaceTest';
    // this.dialogModel.message = 'Please Confirm Your Message';
  }
  public openConfirmationDialog() : void {

    // const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
    //     width: 'auto',

    //     data: { title: this.dialogModel.title, message: this.dialogModel.message}
    // });

    // dialogRef.afterClosed().subscribe(result => {
    //    // this.model.keyWord = result.keyword;
    //     this.onSubmit(result);
    // });
}

}