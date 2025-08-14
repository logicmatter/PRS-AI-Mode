import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth-guard.service';
import { AppComponent } from './app.component';

const routes: Routes = [
  {
    path: "appEvalution/:appId",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appEvalution/:appId/:id",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "appEvalution/:appId/:id/:action",
    component: AppComponent,
    canActivate: [AuthGuard]
  },
  { path: "appEvalution", component: AppComponent, canActivate: [AuthGuard] },
  { path: "home/appEvalution", redirectTo: "appEvalution" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
