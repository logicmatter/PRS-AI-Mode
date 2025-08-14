import { SearchModule } from "./../../../../src/app/pages/search/search.module";

import { MatDialogModule } from "@angular/material/dialog";
import { MatSelectModule } from "@angular/material/select";
// import { SpinnerComponent } from "./../../../../src/app/pages/spinner/spinner.component";
import { HttpClient, HttpClientModule } from "@angular/common/http";

import { BrowserModule } from "@angular/platform-browser";
import { NgModule, ModuleWithProviders } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { AppTrendViewRptComponent } from "./app-trend-view-rpt/app-trend-view-rpt.component";
import { AppTrendCommonParamsComponent } from "./app-trend-common-params/app-trend-common-params.component";

import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";

import { CommondatepickerModule } from "src/app/core/commondatepicker/commondatepicker.module";
const providers = [AppUtilService, HttpClient];
// Angular Material
import { MatCardModule } from "@angular/material/card";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { AppTrendShowReportComponent } from "./app-trend-show-report/app-trend-show-report.component";
import { CoreModule } from "src/app/core/core.module";
import { AppUtilService } from "src/app/PmCore/shared/app-util.service";
//import { SpinnerComponent } from "src/app/pages/spinner/spinner.component";

@NgModule({
  declarations: [
    AppComponent,
    AppTrendViewRptComponent,
    AppTrendCommonParamsComponent,
    AppTrendShowReportComponent
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
    CommondatepickerModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    SearchModule,
    CoreModule
  ],
  exports: [
    CoreModule
  ],
  providers,
  bootstrap: [AppComponent]
})
export class AppModule { }
@NgModule({})
export class AppTrendSharedModule {
  static forRoot(): ModuleWithProviders<AppModule> {
    return {
      ngModule: AppModule,
      providers
    };
  }
}
