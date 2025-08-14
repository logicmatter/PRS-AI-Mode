import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth-guard.service';
import { AppComponent } from './app.component';

const routes: Routes = [
  {
    path: "appReturns/:appId",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appReturns/:appId/:id",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appReturns/:appId/:id/:action",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  { path: "appReturns", component: AppComponent, canActivate: [AuthGuard] },
  { path: "home/appReturns", redirectTo: "appReturns" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
