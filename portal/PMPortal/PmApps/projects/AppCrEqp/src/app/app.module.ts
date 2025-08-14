import { SearchModule } from "./../../../../src/app/pages/search/search.module";
import { MatIconModule } from "@angular/material/icon";
import { MatDialogModule } from "@angular/material/dialog";
import { MatSelectModule } from "@angular/material/select";
// import { SpinnerComponent } from "./../../../../src/app/pages/spinner/spinner.component";
import { HttpClient, HttpClientModule } from "@angular/common/http";

import { BrowserModule } from "@angular/platform-browser";
import { NgModule, ModuleWithProviders } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";
import { CreqStandardComponent } from "./creq-standard/creq-standard.component";
import { CreqLocationComponent } from "./creq-location/creq-location.component";

const providers = [AppUtilService, HttpClient];
// Angular Material
import { MatCardModule } from "@angular/material/card";
import { AddFacetComponent } from "./add-facet/add-facet.component";
import { AddStandardComponent } from "./add-standard/add-standard.component";
import { AddLocationComponent } from "./add-location/add-location.component";
import { ConfigureComponent } from "./configure/configure.component";
import { ShowReportComponent } from "./show-report/show-report.component";
import { CreqFacetComponent } from "./creq-facet/creq-facet.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';


import { CREqViewRptComponent } from "./creq-view-rpt/creq-view-rpt.component";
import { CREqCommonParamsComponent } from "./creq-common-params/creq-common-params.component";
import { SystemActivitiesModule } from "src/app/pages/system-activities/system-activities.module";
import { CoreModule } from "src/app/core/core.module";
import { AppUtilService } from "src/app/PmCore/shared/app-util.service";
import { AddComplianceprofileComponent } from './add-complianceprofile/add-complianceprofile.component';
import { CreqComplianceprofileComponent } from './creq-complianceprofile/creq-complianceprofile.component';
import { MatSortModule } from "@angular/material/sort";

@NgModule({
  declarations: [
    AppComponent,
    CREqViewRptComponent,
    CREqCommonParamsComponent,
    CreqStandardComponent,
    CreqLocationComponent,
    AddFacetComponent,
    AddStandardComponent,
    AddLocationComponent,
    ConfigureComponent,
    ShowReportComponent,
    CreqFacetComponent,
    AddComplianceprofileComponent,
    CreqComplianceprofileComponent
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
    SystemActivitiesModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatProgressBarModule,
    SearchModule,
    CoreModule,
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
export class AppCrEqSharedModule {
  static forRoot(): ModuleWithProviders<AppModule> {
    return {
      ngModule: AppModule,
      providers
    };
  }
}
