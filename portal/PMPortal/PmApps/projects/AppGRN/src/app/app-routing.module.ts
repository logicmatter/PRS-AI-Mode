import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth-guard.service';
import { AppComponent } from './app.component';


const routes: Routes = [
  {
    path: "appGRN/:appId",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appGRN/:appId/:id",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appGRN/:appId/:id/:action",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  { path: "appGRN", component: AppComponent, canActivate: [AuthGuard] },
  { path: "home/appGRN", redirectTo: "appGRN" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
