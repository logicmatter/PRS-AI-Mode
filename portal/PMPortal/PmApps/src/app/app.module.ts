// Angular
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormsModule } from "@angular/forms";

// Material
import { MaterialModule } from "./PmCore/shared/material-module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

// Model Components
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { LayoutModule } from "./layout/index";
import { CoreModule } from "./core/core.module";
import { ToastrModule } from "ngx-toastr";
import { AuthModule } from "./auth/auth.module";
import { JwtInterceptor } from './PmCore/helpers/jwt.interceptor';
import { ErrorInterceptor } from './PmCore/helpers/error.interceptor';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    MaterialModule,
    ReactiveFormsModule,
    LayoutModule,
    CoreModule,
    AuthModule,
    ToastrModule.forRoot({
      timeOut: 2500,
      positionClass: "toast-top-center",
      preventDuplicates: true
    })
  ],
  exports: [MaterialModule, CoreModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
