import { AddLocationComponent } from "./add-location/add-location.component";
import { AddStandardComponent } from "./add-standard/add-standard.component";
import { ConfigureComponent } from "./configure/configure.component";
import { AddFacetComponent } from "./add-facet/add-facet.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CREqViewRptComponent } from "./creq-view-rpt/creq-view-rpt.component";
import { AppComponent } from "projects/AppCrEqp/src/app/app.component";
import { AuthGuard } from "src/app/guards/auth-guard.service";

const routes: Routes = [
  { path: "appCrEq/:appId", component: AppComponent, canActivate: [AuthGuard] },
  {
    path: "appCrEq/:appId/:id",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appCrEq/:appId/:id/:action",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  { path: "appCrEq", component: AppComponent, canActivate: [AuthGuard] },
  //{ path: "appCrEq/listRpt/:id", component: AppComponent },
  //{ path: "appCrEq/listRpt", component: AppComponent },
  //{ path: "appCrEq/listRpt/viewRpt/:id", component: CREqViewRptComponent },
  {
    path: "appCrEq/createRpt",
    component: CREqViewRptComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appCrEq/config",
    component: ConfigureComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appCrEq/config/addFacet",
    component: AddFacetComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appCrEq/config/addStandard",
    component: AddStandardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appCrEq/config/addLocation",
    component: AddLocationComponent,
    canActivate: [AuthGuard]
  },
  { path: "home/appCrEq", redirectTo: "appCrEq" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
