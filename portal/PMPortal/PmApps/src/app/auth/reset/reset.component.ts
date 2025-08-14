import { Component, OnInit } from '@angular/core';
import { UserService } from './../../PmCore/services/UserService/UserService.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from 'src/app/PmCore/services/utility.service';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss']
})
export class ResetComponent implements OnInit {
  resetObject = new ResetPasswordModel();
  resetCode: string;
  uId: string;
  resetForm: FormGroup = new FormGroup({
    newPassword: new FormControl(''),
    confirmPassword: new FormControl('')
  });
  userEmail: string = '';
  pass;
  pass1;
  new: boolean = false;
  confirm: boolean = false;

  constructor(private route: ActivatedRoute, private toastr: ToastrService, private coreUtility: UtilityService,
    private router: Router, private userService: UserService, private fb: FormBuilder
  ) {

  }
  showHide() {
    if (this.pass === 'password') {
      this.pass = 'text';
      this.new= true;
    } else {
      this.pass = 'password';
      this.new = false;
    }
  }
  showHide1() {
    if (this.pass1 === 'password') {
      this.pass1 = 'text';
      this.confirm= true;
    } else {
      this.pass1 = 'password';
      this.confirm = false;
    }
  }
  ngOnInit() {
    if (localStorage.bearerToken) {
      localStorage.clear();
      location.reload();
    }
    this.pass = 'password';
    this.pass1 = 'password';
    this.resetCode = this.route.snapshot.queryParams["c"];
    this.uId = this.route.snapshot.queryParams["u"];
    if (this.uId) {

      this.resetObject.code = this.resetCode.replace(/\s/g, "+");
      this.resetObject.userId = this.uId;
      this.resetForm = this.fb.group({
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
      this.userService.verifyUserExistsById(this.uId).subscribe(resp => {
        if (resp.status) {
          this.toastr.error(resp.message);
          this.router.navigate(["/auth/login"]);
        } else {
          this.userEmail = resp;
        }
      });
    }
  }

  get f() { return this.resetForm.controls; }

  comparePassword() {

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

  resetPassword() {
    if (this.resetForm.invalid) {
      return;
    }
    this.resetObject.password = this.resetForm.controls["newPassword"].value;
    this.resetObject.confirmPassword = this.resetForm.controls["confirmPassword"].value;
    this.userService.resetPassword(this.resetObject).subscribe(resp => {
      if (resp.status) {
        this.toastr.error(resp.message + ' Please try forgot password again');
      } else {
        this.toastr.success(resp);
      }
      this.router.navigate(["/auth/login"]);
    });
  }
}
export class ResetPasswordModel {
  code: string;
  email: string;
  password: string;
  confirmPassword: string;
  userId: string;
};
