import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { TenantService } from '../../PmCore/services/TenantService/TenantService.service';
import { Tenant } from '../../PmModel/tenant.model';
import { AppUtilService } from 'src/app/PmCore/shared/app-util.service';
import { UtilityService } from 'src/app/PmCore/services/utility.service';
import { ToolbarComponent } from 'src/app/layout';
@Component({
  selector: 'app-tenant',
  templateUrl: './tenant.component.html',
  styleUrls: ['./tenant.component.scss']
})
export class TenantComponent implements OnInit {
  ngUnsubscribe: Subject<void> = new Subject<void>();
  panelOpenState = false;
  tenantsList: any;
  isExpanded = false;
  indexExpanded: number = 0;
  isTenantModelLoading: boolean = true;
  isReadOnly: boolean = true;
  isEdit: boolean = false;
  tenantId: string = '';
  tenantModel: Tenant = new Tenant();
  errorMsg: string = '';
  currentTenantName: string = '';
  selectedVersionType: any;
  showConfig = false;
  isExists = false;
  tenantTerm$ = new Subject<string>();
  results: Object;
  tenantFormGroup: any;
  invalid: boolean;
  invalidEmail: boolean;
  i: number = -1;
  loadComponent: boolean = false;
  isDateRangeValid: boolean = false;
  showSpinner: boolean;
  isLoading: boolean = true;
  isDownload: boolean = true;
  tenants: any;
  previousTenant: string;
  constructor(public tenantService: TenantService, private formBuilder: FormBuilder, private _utility: AppUtilService,
    public utility: UtilityService, public _toolbar: ToolbarComponent,) {
    // this.tenantService.verifyTenant(this.tenantTerm$).pipe(takeUntil(this.ngUnsubscribe))
    //   .subscribe(results => {
    //     // this.tenantInfo = this.tenants;
    //     if (results && results != "" && results != null) {
    //       if (results.tenantName != this.currentTenantName) {
    //         this.results = (results !== null) ? results : null;
    //         this.isExists = (results !== null) ? true : false;
    //       }
    //       else {
    //         this.isExists = false;
    //       }
    //     } else {
    //       this.isExists = false;
    //     }
    //   }); 
    this.errorMsg = "";
  }

  ngOnInit() {
    var mastertenantValue = localStorage.getItem('mastertenant');
    if (mastertenantValue == "true") {
      localStorage.setItem('mastertenant', 'false');
      this.tenantService.triggerTenantSelected(this._utility.tenantId);
    }
    this._toolbar.enablebutton();
    this.utility.entitySelected = "Reports"
    this._utility.showSpinner = false;
    this.getTenants();
    this.tenantFormGroup = this.formBuilder.group({
      tenantName: ['', Validators.compose([Validators.required, this.nospaceValidator('tenantName'), Validators.maxLength(50)])],
      tenantMail: ['', Validators.compose([Validators.required, this.isEmailValid('tenantMail')])],
    });
  }

  getTenants() {
    this.tenantService.currentTenant.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      tenant => {
        this.tenants = tenant;
        if (tenant.tenantId === undefined) {
          return;
        }
        //   this.tenantService.getTenantsList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
        //     this.tenantsList = resp;
        this.getTenant(tenant.tenantId);
        this.isLoading = false;
        //   });
      }, err => {
        console.log(err);
      });
  }

  isEmailValid(control) {
    return control => {
      var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return regex.test(control.value) ? null : { invalidEmail: true };
    }
  }
  get f() { return this.tenantFormGroup.controls; }
  public nospaceValidator(control) {
    return control => {
      var regex = /^[a-zA-Z0-9_\\\/.’'-]+(?: +[A-Za-z0-9_\\\/.’'-]+)*$/;
      return regex.test(control.value) ? null : { invalid: true };
    }
  }
  editTenant() {

  }
  getTenant(tenantId) {
    this.showSpinner = true;
    this.selectedVersionType = 1;
    this.showConfig = false;
    this.isExists = false;
    // this.isDatePick = true;
    this.isTenantModelLoading = true;
    if (this.isEdit) {
      this.isEdit = this.isEdit ? false : true;
      this.isReadOnly = true;
    }
    // this.isExpanded = !this.isExpanded;
    this.currentTenantName = this.tenantService.currentTenantValue.tenantName;
    this.errorMsg = "";
    this.tenantId = tenantId;
    this.isEdit = true;
    if (this.tenantId !== 'edit') {
      this.tenantService.getTenantDetails(this.tenantId).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          results => {
            this.tenantModel = results != null ? results : null;
            this.isTenantModelLoading = false;
            console.log(this.tenantModel);
            this.showSpinner = false;
          });
    }

  }

  isReadOnlyFalse(tenant) {
    this.isReadOnly = !this.isReadOnly;
  }
  onChange(obj) {

  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
