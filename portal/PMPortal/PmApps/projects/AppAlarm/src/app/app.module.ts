import { SearchModule } from "./../../../../src/app/pages/search/search.module";
import { MatDialogModule } from '@angular/material/dialog';

import { MatSelectModule } from "@angular/material/select";
// import { SpinnerComponent } from "./../../../../src/app/pages/spinner/spinner.component";
import { HttpClient, HttpClientModule } from "@angular/common/http";

import { BrowserModule } from "@angular/platform-browser";
import { NgModule, ModuleWithProviders } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { AppAlarmViewRptComponent } from "./app-alarm-view-rpt/app-alarm-view-rpt.component";
import { AppAlarmCommonParamsComponent } from "./app-alarm-common-params/app-alarm-common-params.component";

import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";

const providers = [AppUtilService, HttpClient];
// Angular Material
import { MatCardModule } from "@angular/material/card";

import { MatTooltipModule } from "@angular/material/tooltip";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { AppAlarmShowReportComponent } from "./app-alarm-show-report/app-alarm-show-report.component";
//import { SpinnerComponent } from "src/app/pages/spinner/spinner.component";
//import { SpinnerComponent } from "src/app/pages/spinner/spinner.component";
import { CoreModule } from "src/app/core/core.module";
import { AppUtilService } from "src/app/PmCore/shared/app-util.service";
import { FlowModule } from "src/app/pages/flow/flow.module";

@NgModule({
  declarations: [
    AppComponent,
    AppAlarmViewRptComponent,
    AppAlarmCommonParamsComponent,
    AppAlarmShowReportComponent,

  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    AngularMultiSelectModule,
    MatTooltipModule,
    MatCardModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    SearchModule,
    CoreModule,
    FlowModule
  ],
  providers,
  bootstrap: [AppComponent]
})
export class AppModule { }
@NgModule({})
export class AppAlarmSharedModule {
  static forRoot(): ModuleWithProviders<AppModule> {
    return {
      ngModule: AppModule,
      providers
    };
  }
}
