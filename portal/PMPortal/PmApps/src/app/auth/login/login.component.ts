import { UserService } from './../../PmCore/services/UserService/UserService.service';
// Angular
import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormsModule, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginViewModel } from '../../PmModel/LoginViewModel';
import { AppUser, AppUserAuth } from 'src/app/PmModel/auth.model';
import { TenantService } from 'src/app/PmCore/services';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { TimeoutService } from 'src/app/PmCore/services/timeout.service';
import { DeleteDialog } from 'src/app/PmCore/shared/app-util.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UtilityService } from '../../PmCore/services/utility.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  user: AppUser = new AppUser();
  jwtHelper = new JwtHelperService();
  userObject: AppUserAuth;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  returnUrl: string;

  loginForm: FormGroup;
  loading: boolean = false;
  errorMsg: string = '';
  isValidLicense: boolean = true;
  pass;
  hide: boolean = false;
  isDefaultUser: boolean = false;
  userDefaultForm: FormGroup = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    newEmail: new FormControl(''),
    confirmEmail: new FormControl(''),
    newPassword: new FormControl(''),
    confirmPassword: new FormControl('')
  });
  confirm: boolean = false;
  cPass;
  constructor(private userService: UserService,
    private tenantService: TenantService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private coreUtility: UtilityService,
    @Inject('BASE_URL') private baseUrl: string
  ) {

  }
  showHide() {
    if (this.pass === 'password') {
      this.pass = 'text';
      this.hide= true;
    } else {
      this.pass = 'password';
      this.hide = false;
    }
  }
  showHide1() {
    if (this.cPass === 'password') {
      this.cPass = 'text';
      this.confirm= true;
    } else {
      this.cPass = 'password';
      this.confirm = false;
    }
  }
  ngOnInit() {
    if (JSON.parse(localStorage.getItem('RememberMe')) !== null) {
      this.user.username = localStorage.getItem('Name');
      this.user.rememberme = JSON.parse(localStorage.getItem('RememberMe'));
    }

    this.pass = 'password';
    this.cPass = 'password';
    this.validateLicense();
    if (localStorage.bearerToken) {
      const token = localStorage.bearerToken;

      if (!this.jwtHelper.isTokenExpired(token)) {
        this.router.navigate(['home/home-dashboard']);
        return;
      }
    }
    if (Object.keys(this.tenantService.commonModel).length != 0) {
      this.router.navigate(['home/home-dashboard']);
    }
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.loginForm = new FormGroup({
      username: new FormControl(this.user.username, [
        Validators.required,
        Validators.minLength(4),
        Validators.email,
        //Validators.pattern('/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/')
      ]),
      password: new FormControl(this.user.password, [
        Validators.required,
        Validators.minLength(6)
      ])
    });
    this.userDefaultForm = this.fb.group({
      firstName: ['', Validators.compose([Validators.required])],
      lastName: [''],
      newEmail: ['', Validators.compose([Validators.required, Validators.email])],
      confirmEmail: ['', Validators.compose([Validators.required])],
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
        validator: [this.passwordMatchValidator, this.mailMatchValidator]
      });
  }
  get f() { return this.userDefaultForm.controls; }
  login() {
    this.errorMsg = '';
    this.loading = true;
    if (this.user.rememberme) {
      localStorage.setItem('Name', this.user.username);
      localStorage.setItem('RememberMe', JSON.stringify(this.user.rememberme));
    } else {
      localStorage.removeItem('Name');
      localStorage.removeItem('RememberMe');
      localStorage.setItem('Name', this.user.username);
      localStorage.setItem('RememberMe', JSON.stringify(this.user.rememberme));
  }
    this.userService.login(this.user)
    .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(resp => {
        if (resp.isAuthenticated) {
          this.userObject = resp;
            localStorage.setItem('bearerToken',
              this.userObject.bearerToken);
            window.location.href =  'home/home-dashboard';
        } else {
          var errMsg = Object.assign({}, resp);
          this.errorMsg = errMsg.message;
          this.toastr.error(errMsg.message);
          this.loading = false;
        }
      },
        () => {
          // Initialize security object to display error message
          this.userObject = new AppUserAuth();

          this.loading = false;
        });
  }
  updateDefaultUser() {
    if (this.userDefaultForm.invalid) {
      return;
    }
    let regForm = {
      id: this.userObject.userId,
      firstName: this.userDefaultForm.value.firstName,
      lastName: this.userDefaultForm.value.lastName,
      email: this.userDefaultForm.value.newEmail,
      password: this.userDefaultForm.value.newPassword,
      company: '',
      roles: '',
      tenant: []
    }
    this.loading = true;
    this.userService.updateDefaultUser(regForm)
      .subscribe(
        data => {
          this.loading = false;
          this.toastr.success('User updated successfully. Please login to continue with updated email');
          window.location.reload();
        },
        error => {
          this.toastr.error('User update failed. Please try again.');
          this.loading = false;
        });
  }
  validateLicense() {
    this.userService.validateLicense().pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      if (resp.value) {
        this.isValidLicense = true;
      } else {
        this.isValidLicense = false;
      }
    }, error => {
      this.isValidLicense = false;
    });
  }
ngOnDestroy(){
  this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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
    const newEmail: string = control.get('newEmail').value; // get password from our password form control
    const confirmEmail: string = control.get('confirmEmail').value; // get password from our confirmPassword form control
    // compare is the password math
    if (newEmail !== confirmEmail) {
      // if they don't match, set an error in our confirmPassword form control
      control.get('confirmEmail').setErrors({ NoMailMatch: true });
    }
  }
}
