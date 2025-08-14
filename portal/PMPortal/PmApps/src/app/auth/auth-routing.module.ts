// Angular Libraries
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Auth Module Component
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetComponent } from './reset/reset.component';
import { SessionTimeoutComponent } from './session-timeout/session-timeout.component';
import { LicenseValidatorComponent } from './license-validator/license-validator.component';
const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'reset',
    component: ResetComponent
  },
  {
    path: 'session',
    component: SessionTimeoutComponent
  },
  {
    path: 'license',
    component: LicenseValidatorComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
