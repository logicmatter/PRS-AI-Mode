import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AppComponent } from "./app.component";
import { AuthGuard } from "src/app/guards/auth-guard.service";
import { AppEnergyViewRptComponent } from "./app-energy-view-rpt/app-energy-view-rpt.component";

const routes: Routes = [
  {
    path: "appEnergy/:appId",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appEnergy/:appId/:id",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appEnergy/:appId/:id/:action",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "home/apps/appEnergy/:appId/create",
    component: AppEnergyViewRptComponent,
    canActivate: [AuthGuard]
  },
  { path: "appEnergy", component: AppComponent, canActivate: [AuthGuard] },
  { path: "home/appEnergy", redirectTo: "appEnergy" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
