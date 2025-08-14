import { CoreUtilityService } from "src/app/PmCore/shared/core-utility.service";
import { MatSelectModule } from "@angular/material/select";
import { SearchModule } from "./../../../../src/app/pages/search/search.module";
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { HttpClient, HttpClientModule } from "@angular/common/http";

import { BrowserModule } from "@angular/platform-browser";
import { NgModule, ModuleWithProviders } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { CREnvViewRptComponent } from "./crenv-view-rpt/crenv-view-rpt.component";
import { CREnvCommonParamsComponent } from "./crenv-common-params/crenv-common-params.component";

import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";
import { CrenvStandardComponent } from "./crenv-standard/crenv-standard.component";
import { CrenvLocationComponent } from "./crenv-location/crenv-location.component";
import { MatExpansionModule } from '@angular/material/expansion';

const providers = [AppUtilService, HttpClient, CoreUtilityService];
// Angular Material
import { MatCardModule } from "@angular/material/card";
import { AddFacetComponent } from "./add-facet/add-facet.component";
import { AddStandardComponent } from "./add-standard/add-standard.component";
import { AddLocationComponent } from "./add-location/add-location.component";
import { ConfigureComponent } from "./configure/configure.component";
import { ShowReportComponent } from "./show-report/show-report.component";
import { CrenvFacetComponent } from "./crenv-facet/crenv-facet.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { CoreModule } from "src/app/core/core.module";
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import {
  AppUtilService,
  DeleteDialog
} from "src/app/PmCore/shared/app-util.service";
import { AddComplianceprofileComponent } from './add-complianceprofile/add-complianceprofile.component';
import { CrenvComplianceprofileComponent } from './crenv-complianceprofile/crenv-complianceprofile.component';
//import { SpinnerComponent } from "../../../../src/app/PmCore/shared/onlydigit.directive/spinner.component";

@NgModule({
  declarations: [
    AppComponent,
    CREnvViewRptComponent,
    CREnvCommonParamsComponent,
    CrenvStandardComponent,
    CrenvLocationComponent,
    AddFacetComponent,
    AddStandardComponent,
    AddLocationComponent,
    ConfigureComponent,
    ShowReportComponent,
    CrenvFacetComponent,
    AddComplianceprofileComponent,
    CrenvComplianceprofileComponent
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
    CoreModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    SearchModule,
    CoreModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatTableModule,
    MatSortModule
  ],
  providers,
  bootstrap: [AppComponent]
})
export class AppModule { }
@NgModule({})
export class AppCrEnvSharedModule {
  static forRoot(): ModuleWithProviders<AppModule> {
    return {
      ngModule: AppModule,
      providers
    };
  }
}
