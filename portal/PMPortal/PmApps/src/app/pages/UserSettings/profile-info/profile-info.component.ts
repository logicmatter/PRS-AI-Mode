import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TenantService, UserService } from 'src/app/PmCore/services';
import { UtilityService } from 'src/app/PmCore/services/utility.service';
import { AppUtilService } from 'src/app/PmCore/shared/app-util.service';
import { AppUser } from 'src/app/PmModel/auth.model';
import { ToolbarComponent } from 'src/app/layout';

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.scss']
})
export class ProfileInfoComponent implements OnInit {
  helper = new JwtHelperService();
  resetObject = new ResetPasswordModel();
  loading: boolean = false;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  user: AppUser = new AppUser();
  userProfile: FormGroup = new FormGroup({
    id: new FormControl(''),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl(''),
    role: new FormControl(''),
    newPassword: new FormControl(''),
    confirmPassword: new FormControl('')
  });

  resetForm: FormGroup = new FormGroup({
    currentPassword: new FormControl(''),
    newPassword: new FormControl(''),
    confirmPassword: new FormControl('')
  });
  pass: string;
  hide: boolean;
  cPass: string;
  confirm: boolean;
  showResetForm: boolean = false;
  userId: string;
  oPass: string;
  old: boolean;
  showChangePassword: boolean;
  errMsg: any;
  userDetails: any;
  isAuthorized: any;
  tenants: any;
  valid: boolean;
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    public tenantService: TenantService,
    public utility: UtilityService,
    public _utility: AppUtilService,
    public _toolbar: ToolbarComponent,) {
  }

  ngOnInit() {
    var mastertenantValue = localStorage.getItem('mastertenant');
    if (mastertenantValue == "true") {
      localStorage.setItem('mastertenant', 'false');
      this.tenantService.triggerTenantSelected(this._utility.tenantId);
    }
    this.getTenants();
    this._toolbar.enablebutton();
    this.utility.entitySelected = "Reports"
    this.pass = 'password';
    this.cPass = 'password';
    this.oPass = 'password';
    this.userProfile = this.fb.group({
      id: [''],
      firstName: ['', Validators.compose([Validators.required])],
      lastName: [''],
      role: [''],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      confirmEmail: ['', Validators.compose([Validators.required])],
      newPassword: ['', Validators.compose([Validators.required,
      UtilityService.patternValidator(/\d/, { hasNumber: true }),
      UtilityService.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
      UtilityService.patternValidator(/[a-z]/, { hasSmallCase: true }),
      UtilityService.patternValidator(/[#$^!*@%&]/, { hasSpecialCharacters: true }),
      Validators.minLength(8)
      ])],
      confirmPassword: ['', Validators.compose([Validators.required])]
    });
    this.resetForm = this.fb.group({
      currentPassword: ['', Validators.compose([Validators.required])],
      newPassword: ['', Validators.compose([Validators.required,
      UtilityService.patternValidator(/\d/, { hasNumber: true }),
      UtilityService.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
      UtilityService.patternValidator(/[a-z]/, { hasSmallCase: true }),
      UtilityService.patternValidator(/[#$^!*@%&]/, { hasSpecialCharacters: true }),
      Validators.minLength(8)
      ])],
      confirmPassword: ['', Validators.compose([Validators.required])]
    },
      {
        // check whether our password and confirm password match
        validator: this.passwordMatchValidator
      });
    this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data['id']) {
        this.getUserDetails(data['id']);
      } else {
        this.toastr.error("User Id is required");
      }
    });
  }
  get f1() { return this.userProfile.controls; }
  get f() { return this.resetForm.controls; }
  showHide() {
    if (this.pass === 'password') {
      this.pass = 'text';
      this.hide = true;
    } else {
      this.pass = 'password';
      this.hide = false;
    }
  }
  showHide1() {
    if (this.cPass === 'password') {
      this.cPass = 'text';
      this.confirm = true;
    } else {
      this.cPass = 'password';
      this.confirm = false;
    }
  }
  showHide2() {
    if (this.oPass === 'password') {
      this.oPass = 'text';
      this.old = true;
    } else {
      this.oPass = 'password';
      this.old = false;
    }
  }
  updateUserProfile() {

  }
  getUserDetails(userId) {
    this.userService.GetUserInfoById(userId).subscribe(resp => {
      if (resp) {
        this.userId = resp.id;
        localStorage.getItem
        this.userProfile.controls['id'].setValue(resp.id);
        this.userProfile.controls['firstName'].setValue(resp.firstName);
        this.userProfile.controls['lastName'].setValue(resp.lastName);
        this.userProfile.controls['email'].setValue(resp.email);
        this.userProfile.controls['role'].setValue(resp.roles[0]);
      }
    }, err => {
      this.toastr.error(err.error.message);
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

        //   });
      }, err => {
        console.log(err);
      });
  }

  validateCurrentPassword() {
    this.user.username = this.userProfile.controls['email'].value;
    this.user.password = this.resetForm.controls["currentPassword"].value;
    this.userService.login(this.user)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(resp => {
        if (resp.isAuthenticated) {
          this.errMsg = '';
          this.showChangePassword = true;
          this.valid = true;
        } else {
          this.errMsg = Object.assign({}, resp);
          this.loading = false;
          this.valid = false;
        }
      });
  }
  resetPassword() {
    this.loading = true;
    if (this.resetForm.invalid) {
      return;
    }
    this.resetObject.id = this.userId;
    this.resetObject.currentPassword = this.resetForm.controls["currentPassword"].value;
    this.resetObject.password = this.resetForm.controls["newPassword"].value;
    this.resetObject.confirmPassword = this.resetForm.controls["confirmPassword"].value;
    this.userService.userResetPassword(this.resetObject).subscribe(resp => {
      if (resp.status) {
        this.toastr.error(resp.message + ' Please try forgot password again');
      } else {
        this.toastr.success(resp);
        this.showResetForm = false;
        this.hide = false;
        this.confirm = false;
        this.resetForm.reset();
        this.loading = false;
      }
      // this.router.navigate(["/auth/login"]);
    });
  }
  passwordMatchValidator(control: AbstractControl) {
    const password: string = control.get('newPassword').value; // get password from our password form control
    const confirmPassword: string = control.get('confirmPassword').value; // get password from our confirmPassword form control
    // compare is the password math
    if (password !== confirmPassword) {
      // if they don't match, set an error in our confirmPassword form control
      control.get('confirmPassword').setErrors({ NoPassswordMatch: true });
    }
  }
  mailMatchValidator(control: AbstractControl) {
    const newEmail: string = control.get('email').value; // get password from our password form control
    const confirmEmail: string = control.get('confirmEmail').value; // get password from our confirmPassword form control
    // compare is the password math
    if (newEmail !== confirmEmail) {
      // if they don't match, set an error in our confirmPassword form control
      control.get('confirmEmail').setErrors({ NoMailMatch: true });
    }
  }
}
export class ResetPasswordModel {
  id: string;
  email: string;
  currentPassword: string;
  password: string;
  confirmPassword: string;
  userId: string;
};