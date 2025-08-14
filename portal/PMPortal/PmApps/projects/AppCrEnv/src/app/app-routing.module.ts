import { AddLocationComponent } from "./add-location/add-location.component";
import { AddStandardComponent } from "./add-standard/add-standard.component";
import { ConfigureComponent } from "./configure/configure.component";
import { AddFacetComponent } from "./add-facet/add-facet.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { CREnvViewRptComponent } from "./crenv-view-rpt/crenv-view-rpt.component";
import { AppComponent } from "projects/AppCrEnv/src/app/app.component";
import { AuthGuard } from "src/app/guards/auth-guard.service";

const routes: Routes = [
  {
    path: "appCrEnv/:appId",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appCrEnv/:appId/:id",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appCrEnv/:appId/:id/:action",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  { path: "appCrEnv", component: AppComponent, canActivate: [AuthGuard] },
  {
    path: "appCrEnv/listRpt/viewRpt/:id",
    component: CREnvViewRptComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appCrEnv/createRpt",
    component: CREnvViewRptComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appCrEnv/config",
    component: ConfigureComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appCrEnv/config/addFacet",
    component: AddFacetComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appCrEnv/config/addStandard",
    component: AddStandardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appCrEnv/config/addLocation",
    component: AddLocationComponent,
    canActivate: [AuthGuard]
  },
  { path: "home/appCrEnv", redirectTo: "appCrEnv" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }