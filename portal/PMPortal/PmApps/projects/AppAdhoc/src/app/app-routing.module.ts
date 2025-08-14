import { AdhocReportComponent } from "./adhoc-report/adhoc-report.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AdhocAnalysisComponent } from "./adhoc-analysis/adhoc-analysis.component";
import { AdhocDetailsComponent } from "./adhoc-analysisdetails/adhoc-analysisdetails.component";
import { AuthGuard } from "src/app/guards/auth-guard.service";


const routes: Routes = [
  //{ path: "appAdhoc/test", component: AdhocReportComponent },
  {
    path: "adhocAnalysis",
    component: AdhocAnalysisComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "adhocdetails",
        component: AdhocDetailsComponent,
        canActivate: [AuthGuard]
      }
    ]
  },
  { path: "appAdhoc/:appName", component: AdhocReportComponent, canActivate: [AuthGuard] },
  {
    path: "home/appAdhoc",
    redirectTo: "adhocAnalysis"

  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
