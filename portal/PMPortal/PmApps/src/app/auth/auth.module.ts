import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';


// Routing Module
import { AuthRoutingModule } from './auth-routing.module';

// Auth Module Components
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetComponent } from './reset/reset.component';
import { HeaderComponent } from './header/header.component';
import { SessionTimeoutComponent } from './session-timeout/session-timeout.component';
import { LicenseValidatorComponent } from './license-validator/license-validator.component';

@NgModule({
  declarations: [LoginComponent, ForgotPasswordComponent, ResetComponent,
    HeaderComponent, SessionTimeoutComponent, LicenseValidatorComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AuthRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  exports: [
    LoginComponent,
    ForgotPasswordComponent,
    ResetComponent,
    HeaderComponent,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    HeaderComponent
  ]
})
export class AuthModule { }
