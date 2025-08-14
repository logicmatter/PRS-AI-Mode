import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth-guard.service';
import { AppComponent } from './app.component';

const routes: Routes = [
  {
    path: "appFTR/:appId",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appFTR/:appId/:id",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appFTR/:appId/:id/:action",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  { path: "appFTR", component: AppComponent, canActivate: [AuthGuard] },
  { path: "home/appFTR", redirectTo: "appFTR" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
