import { AuthGuard } from "./../../../../src/app/guards/auth-guard.service";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AppComponent } from "projects/AppAlarm/src/app/app.component";
import { AppAlarmViewRptComponent } from "./app-alarm-view-rpt/app-alarm-view-rpt.component";

const routes: Routes = [
  {
    path: "appAlarm/:appId",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appAlarm/:appId/:id",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appAlarm/:appId/:id/:action",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "home/apps/appAlarm/:appId/create",
    component: AppAlarmViewRptComponent,
    canActivate: [AuthGuard]
  },

  { path: "appAlarm", component: AppComponent, canActivate: [AuthGuard] },
  { path: "home/appAlarm", redirectTo: "appAlarm" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
