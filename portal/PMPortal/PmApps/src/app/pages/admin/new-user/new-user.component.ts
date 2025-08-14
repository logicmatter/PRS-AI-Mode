import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { UserService } from './../../../PmCore/services/UserService/UserService.service';
import { TenantService } from './../../../PmCore/services/TenantService/TenantService.service';
import { ReportUserModel } from 'src/app/PmModel/ReportUserModel';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { first, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AppUtilService } from 'src/app/PmCore/shared/app-util.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-admin-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.scss']
})
export class NewUserComponent implements OnInit, AfterViewInit {

  registerForm: FormGroup = new FormGroup({
    id: new FormControl(''),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl(''),
    phone: new FormControl(''),
    roles: new FormControl(''),
    company: new FormControl(''),
  });
  ngUnsubscribe: Subject<void> = new Subject<void>();
  loading = false;
  submitted = false;
  isManager = false;
  isNew = false;
  tenantsList = [];
  selectedTenants = [];

  dropdownSettings = {
    singleSelection: false,
    text: "Select Tenant",
    badgeShowLimit: 1,
    selectAllText: "Select all Tenants",
    unSelectAllText: "UnSelect all Tenants",
    enableSearchFilter: false,
    classes: "myclass custom-class",
    position: "top",
    maxHeight: this.calculateMaxHeight(this.tenantsList.length),
    itemsShowLimit: 2,
    scrollable: true,
    lazyLoading: true,
    virtualScroll: true,
    loadViewDistance: 2,
    stopScrollPropagation: true,
  };

  calculateMaxHeight(numItems: number): string {
    // Calculate max height based on the number of items
    // You can adjust this calculation as per your requirement
    const maxHeightPerItem = 30; // Assuming each item has a height of 30px
    const maxItemsToShow = 5; // Maximum number of items to display without scrolling
    const calculatedHeight = Math.min(numItems, maxItemsToShow) * maxHeightPerItem;
    return calculatedHeight + 'px';
  }


  constructor(private userService: UserService, public tenantService: TenantService, private toastr: ToastrService, private _utility: AppUtilService,
    private route: ActivatedRoute, private router: Router, private formBuilder: FormBuilder) {

    // if (this._utility.licenseInfo.isLimitedEdition) {
    //   this.toastr.error("This feature is not available in this Edition. Please contact LogicMatter at <b>support@logicmatter.com</b>");
    //   this.router.navigate(['/home/admin']);
    //   return;
    // }

    this.registerForm = this.formBuilder.group({
      id: [''],
      firstName: ['', Validators.required],
      lastName: [''],
      email: ['', [Validators.required, Validators.email, this.VerifyUser()]],
      phone: [''],
      password: [''],
      roles: [['User']],
      company: [''],
      tenant: [[], Validators.required]
    });
    this.isNew = false;
  }

  get f() { return this.registerForm.controls; }

  ngOnInit() {
    this.tenantService.getTenantsList().subscribe(resp => {
      var tenantsList = resp;
      for (let i = 0; i < tenantsList.length; i++) {
        this.tenantsList.push({ id: tenantsList[i].id, itemName: tenantsList[i].tenantName });
      }
    });
    this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data['id']) {
        if (data['id'] == '-1') {
          this.isNew = true;
        } else {
          this.getUserDetails(data['id']);
        }
      } else {
        this.toastr.error("User Id is required");
      }
    });
  }
  ngAfterViewInit() {
  }

  getUserDetails(userId) {
    this.userService.GetUserInfoById(userId).subscribe(resp => {
      if (resp) {
        this.registerForm.controls['id'].setValue(resp.id);
        this.registerForm.controls['firstName'].setValue(resp.firstName);
        this.registerForm.controls['lastName'].setValue(resp.lastName);
        this.registerForm.controls['email'].setValue(resp.email);
        this.registerForm.controls['roles'].setValue(resp.roles);
        if (resp.roles) {
          this.isManager = resp.roles.indexOf('Manager') > -1 ? true : false;
        }
        resp.tenant.forEach((t) => {
          this.selectedTenants.push(this.tenantsList.find((i) => i.id == t));
        });
        this.registerForm.controls['tenant'].setValue(this.selectedTenants);
      }
    }, err => {
      this.toastr.error(err.error.message);
    });
  }

  createNewUser() {
    this.submitted = true;

    // reset alerts on submit
    //this.alertService.clear();

    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }
    let tenants = [];
    this.selectedTenants.forEach((i) => tenants.push(i.id));
    let regForm = {
      id: this.registerForm.value.id,
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      email: this.registerForm.value.email,
      company: '',
      roles: this.registerForm.value.roles,
      tenant: tenants
    }
    this.loading = true;
    if (this.isNew) {
      this.userService.createNewUser(regForm)
        .pipe(first())
        .subscribe(
          data => {
            //this.alertService.success('Registration successful', true);
            this.toastr.success('User created successfully');
            this.router.navigate(['/home/admin/']);
          },
          error => {
            //this.alertService.error(error);
            this.toastr.error('User creation failed');
            this.loading = false;
          });
    } else {
      this.userService.updateUser(regForm)
        .pipe(first())
        .subscribe(
          data => {
            //this.alertService.success('Registration successful', true);

            this.toastr.success('User details updated successfully');
            this.router.navigate(['/home/admin/']);
          },
          error => {
            this.toastr.error('User update failed');
            this.loading = false;
          });
    }
  }
  changeRole() {
    this.isManager = !this.isManager;
    this.registerForm.controls.roles.setValue([]);
    this.registerForm.controls.roles.setValue(this.isManager ? ['Manager'] : ['User']);
  }
  VerifyUser() {
    return () => {

      var controlName = 'email';
      const control = this.registerForm.controls[controlName];

      if (control.errors && !control.errors.verifyUser) {
        // return if another validator has already found an error on the matchingControl
        return;
      }
      if (control.value == '') { control.setErrors({ required: true }); return; };
      this.userService.verifyUserExists(control.value).subscribe(resp => {
        // set error on matchingControl if validation fails
        if (resp) {
          if (resp.id == this.registerForm.controls['id'].value) {
            control.setErrors(null);
          } else {
            control.setErrors({ verifyUser: true });
          }
        } else {
          control.setErrors(null);
        }
      }, err => { this.toastr.error(err.error.Message); });
    }
  }
  OnItemDeSelectAll(item) {
    this.registerForm.controls['tenant'].setValue([]);
    this.registerForm.controls['tenant'].setErrors({ required: true });
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
