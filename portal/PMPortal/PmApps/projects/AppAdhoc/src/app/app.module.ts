import { CoreModule } from "./../../../../src/app/core/core.module";
import { BrowserModule } from "@angular/platform-browser";
import { NgModule, ModuleWithProviders } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AdhocAnalysisComponent } from "./adhoc-analysis/adhoc-analysis.component";
import { AdhocDetailsComponent } from "./adhoc-analysisdetails/adhoc-analysisdetails.component";

import { CommondatepickerModule } from "src/app/core/commondatepicker/commondatepicker.module";
// Material
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { AdhocReportComponent } from "./adhoc-report/adhoc-report.component";
import { AdhocService } from "src/app/PmCore/services/AdhocService/adhoc-service.service";
import { SearchModule } from '../../../../src/app/pages/search/search.module';
const providers = [];
@NgModule({
  declarations: [
    AppComponent,
    AdhocReportComponent,
    AdhocAnalysisComponent,
    AdhocDetailsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatSlideToggleModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatSelectModule,
    CoreModule,
    CommondatepickerModule,
    SearchModule
  ],
  exports: [
    CommondatepickerModule
  ],
  providers: providers,
  bootstrap: [AppComponent]
})
export class AppModule { }

@NgModule({})
export class AppAdhocSharedModule {
  static forRoot(): ModuleWithProviders<AppModule> {
    return {
      ngModule: AppModule,
      providers
    };
  }
}
