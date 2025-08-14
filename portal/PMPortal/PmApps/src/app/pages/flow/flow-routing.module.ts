import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DataSourceDetailComponent } from './data-source-detail/data-source-detail.component';
import { DataFlowDetailComponent } from './data-flow-detail/data-flow-detail.component';
import { DataSourceListComponent } from './data-source-list/data-source-list.component';
import { DataFlowListComponent } from './data-flow-list/data-flow-list.component';
import { FlowDashboardComponent } from './flow-dashboard/flow-dashboard.component';
import { SubscriptionEditComponent } from './subscription-edit/subscription-edit.component';
import { DataLoadHistoryComponent } from './data-load-history/data-load-history.component';
import { DataErrorsListComponent } from './data-errors-list/data-errors-list.component';
import { AuthGuard } from 'src/app/guards/auth-guard.service';
import { RoleguardService } from 'src/app/guards/roleguard.service';
import { TransformersComponent } from './transformers/transformers.component';
import { GatewayComponent } from './gateway/gateway.component';
import { GatewayDetailComponent } from './gateway-detail/gateway-detail.component';



const routes: Routes = [
  { path: '', component: FlowDashboardComponent, pathMatch: 'full' },
  {
    path: 'data-source-list', component: DataSourceListComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: ['Manager', 'User']
    },
    canLoad: [RoleguardService, AuthGuard]
  },
  {
    path: 'data-source-detail/:dataSourceId', component: DataSourceDetailComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: ['Manager', 'User']
    },
    canLoad: [RoleguardService, AuthGuard]
  },
  {
    path: 'subscription-edit/:flowType/:subscriptionId', component: SubscriptionEditComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: ['Manager', 'User']
    },
    canLoad: [RoleguardService, AuthGuard]
  },
  {
    path: 'data-flow-list', component: DataFlowListComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: ['Manager', 'User']
    },
    canLoad: [RoleguardService, AuthGuard]
  },
  {
    path: 'data-flow-detail/:dataFlowId', component: DataFlowDetailComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: ['Manager', 'User']
    },
    canLoad: [RoleguardService, AuthGuard]
  },
  {
    path: 'data-load-history/:dataSourceId/:tenantId', component: DataLoadHistoryComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: ['Manager', 'User']
    },
    canLoad: [RoleguardService, AuthGuard]
  },
  {
    path: 'data-errors-list/:dataSourceId/:historyId/:tenantId', component: DataErrorsListComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: ['Manager', 'User']
    },
    canLoad: [RoleguardService, AuthGuard]
  },
  {
    path: 'Transformers',
    component: TransformersComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: ['Manager', 'User']
    },
    canLoad: [RoleguardService, AuthGuard]
  },
  {
    path: 'Gateway',
    component: GatewayComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: ['Manager', 'User']
    },
    canLoad: [RoleguardService, AuthGuard]
  },
  {
    path: 'gateway-detail/:dataSourceId', component: GatewayDetailComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: ['Manager', 'User']
    },
    canLoad: [RoleguardService, AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlowRoutingModule { }
