import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth-guard.service';
import { AppComponent } from './app.component';

const routes: Routes = [
  {
    path: "appOrderProcessing/:appId",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appOrderProcessing/:appId/:id",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appOrderProcessing/:appId/:id/:action",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  { path: "appOrderProcessing", component: AppComponent, canActivate: [AuthGuard] },
  { path: "home/appOrderProcessing", redirectTo: "appOrderProcessing" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
