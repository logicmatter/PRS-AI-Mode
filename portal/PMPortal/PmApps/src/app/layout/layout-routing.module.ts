import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth-guard.service';
const routes: Routes = [
  {
    path: 'search',
    loadChildren: () => import('../pages/search/search.module').then(m => m.SearchModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'searchobj',
    loadChildren: () => import('../pages/search/obj-search.module').then(m => m.ObjSearchModule),
    canActivate: [AuthGuard]
  }
]


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
