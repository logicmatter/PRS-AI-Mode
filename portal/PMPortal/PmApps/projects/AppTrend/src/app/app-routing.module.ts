import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AppComponent } from "projects/AppTrend/src/app/app.component";
import { AuthGuard } from "src/app/guards/auth-guard.service";
import { AppTrendViewRptComponent } from "./app-trend-view-rpt/app-trend-view-rpt.component";

const routes: Routes = [
  {
    path: "appTrend/:appId",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appTrend/:appId/:id",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appTrend/:appId/:id/:action",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "home/apps/appTrend/:appId/create",
    component: AppTrendViewRptComponent,
    canActivate: [AuthGuard]
  },
  { path: "appTrend", component: AppComponent, canActivate: [AuthGuard] },
  { path: "home/appTrend", redirectTo: "appTrend" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
