import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth-guard.service';
import { AppComponent } from './app.component';


const routes: Routes = [
  {
    path: "appSales/:appId",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appSales/:appId/:id",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appSales/:appId/:id/:action",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  { path: "appSales", component: AppComponent, canActivate: [AuthGuard] },
  { path: "home/appSales", redirectTo: "appSales" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
