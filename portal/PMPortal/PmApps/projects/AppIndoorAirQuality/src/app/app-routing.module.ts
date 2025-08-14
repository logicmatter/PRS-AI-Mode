import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth-guard.service';
import { AppComponent } from './app.component';

const routes: Routes = [
  {
    path: "appIndoor/:appId",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appIndoor/:appId/:id",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appIndoor/:appId/:id/:action",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  { path: "appIndoor", component: AppComponent, canActivate: [AuthGuard] },
  { path: "home/appIndoor", redirectTo: "appIndoor" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
