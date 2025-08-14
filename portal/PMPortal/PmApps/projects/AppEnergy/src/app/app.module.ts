import { CoreModule } from "src/app/core/core.module";
import { MatSelectModule } from "@angular/material/select";
import { SearchModule } from "./../../../../src/app/pages/search/search.module";

import { MatDialogModule } from "@angular/material/dialog";

// import { SpinnerComponent } from "./../../../../src/app/pages/spinner/spinner.component";
import { HttpClient, HttpClientModule } from "@angular/common/http";

import { BrowserModule } from "@angular/platform-browser";
import { NgModule, ModuleWithProviders } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { AppEnergyViewRptComponent } from "./app-energy-view-rpt/app-energy-view-rpt.component";
import { AppEnergyCommonParamsComponent } from "./app-energy-common-params/app-energy-common-params.component";

import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";

const providers = [AppUtilService, HttpClient];
// Angular Material
import { MatCardModule } from "@angular/material/card";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { AppEnergyShowReportComponent } from "./app-energy-show-report/app-energy-show-report.component";
import { AppUtilService } from "src/app/PmCore/shared/app-util.service";
//import { SpinnerComponent } from "src/app/pages/spinner/spinner.component";

@NgModule({
  declarations: [
    AppComponent,
    AppEnergyViewRptComponent,
    AppEnergyCommonParamsComponent,
    AppEnergyShowReportComponent
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
    MatSelectModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    SearchModule,
    CoreModule
  ],
  providers,
  bootstrap: [AppComponent]
})
export class AppModule { }
@NgModule({})
export class AppEnergySharedModule {
  static forRoot(): ModuleWithProviders<AppModule> {
    return {
      ngModule: AppModule,
      providers
    };
  }
}
