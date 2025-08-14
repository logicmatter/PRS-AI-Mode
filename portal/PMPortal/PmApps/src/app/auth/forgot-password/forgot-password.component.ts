import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../PmCore/services/UserService/UserService.service';
import { AppUser, AppUserAuth } from 'src/app/PmModel/auth.model';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  user: AppUser;
  userObject: AppUserAuth;
  forgotForm: FormGroup;
  //username: string;
  validEmailFormat: boolean;
  errorMsg: string = '';
  loading: boolean = false;
  ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor(private userService: UserService, private fb: FormBuilder, private router: Router,
    private toastr: ToastrService, private cdr: ChangeDetectorRef ) { }

  ngOnInit() {
    this.userService.logout();
    this.forgotForm = this.fb.group({
      username: new FormControl('',[
        Validators.required,
        Validators.email
      ])
    });
  }
  onMailChange(newValue) {
    const validEmailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (validEmailRegEx.test(newValue)) {
      this.validEmailFormat = true;
    } else {
      this.validEmailFormat= false;
    }
  }
  forgotPassword() {
    this.loading = true;

    const controls = this.forgotForm.controls;

    // check form
    if (this.forgotForm.invalid) {
      Object.keys(controls).forEach(controlName =>
        controls[controlName].markAsTouched()
      );
      return;
    }
    this.userService.forgotPassword(this.forgotForm.controls["username"].value).pipe(takeUntil(this.ngUnsubscribe)).subscribe(resp => {
      if (resp.status) {
        this.errorMsg = resp.message;
        this.toastr.error(resp.message);
        this.forgotForm.controls["username"].setValue('');
        this.loading = false;
      } else {
        this.toastr.success(resp);
        this.router.navigate(['/auth/login']);
      }
    });
  }
  isControlHasError(controlName: string, validationType: string): boolean {
    const control = this.forgotForm.controls[controlName];
    if (!control) {
      return false;
    }

    const result = control.hasError(validationType) && (control.dirty || control.touched);
    return result;
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
