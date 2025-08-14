// Angular
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Authentication Guards
import { AuthGuard } from '../guards/auth-guard.service';
import { RoleguardService } from '../guards/roleguard.service';
// Components
import { AppsComponent } from './apps/apps.component';
import { TenantComponent } from './tenant/tenant.component';
import { MarketplaceComponent } from './marketplace/marketplace.component';
import { AdminComponent } from './admin/admin.component';
import { UserReportsComponent } from './admin/user-reports/user-reports.component';
import { ReportUsersComponent } from './admin/report-users/report-users.component';
import { NewUserComponent } from './admin/new-user/new-user.component';

import { SchedulerReportsListComponent } from './scheduler/scheduler-reports-list/scheduler-reports-list.component';
import { SchedulerComponent } from './scheduler/scheduler.component';
import { FlowSchedulerComponent } from './scheduler/flow/flow-scheduler.component';

// SharedModules
import { SystemActivitiesComponent } from './system-activities/system-activities.component';
import { ProfileInfoComponent } from './UserSettings/profile-info/profile-info.component';
//import { HDashBoardComponent } from './h-dash-board/h-dash-board.component';
import { HomeDashboardComponent } from './home-dashboard/home-dashboard.component';
import { TenantDashboardComponent } from './tenant-dashboard/tenant-dashboard.component';
import { SubReportsComponent } from './sub-reports/sub-reports.component';
import { AnalyticComponent } from './analytic/analytic.component';

const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  {
    path: 'apps',
    component: AppsComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: ['Manager', 'User']
    },
    canLoad: [RoleguardService, AuthGuard],
    children: [
      {
        // tslint:disable-next-line: max-line-length
        path: 'appCrEnv',
        loadChildren:
          () => import('../../../projects/AppCrEnv/src/app/app.module').then(m => m.AppCrEnvSharedModule),
        canActivate: [AuthGuard],
        data: {
          expectedRole: ['Manager', 'User']
        },
        canLoad: [RoleguardService, AuthGuard],
      },
      {
        // tslint:disable-next-line: max-line-length
        path: 'appAlarm',
        loadChildren: () => import('../../../projects/AppAlarm/src/app/app.module').then(m => m.AppAlarmSharedModule),
        canActivate: [AuthGuard],
        data: {
          expectedRole: ['Manager', 'User']
        },
        canLoad: [RoleguardService, AuthGuard],
      },
      {
        // tslint:disable-next-line: max-line-length
        path: 'appCrEq',
        loadChildren: () => import('../../../projects/AppCrEqp/src/app/app.module').then(m => m.AppCrEqSharedModule),
        canActivate: [AuthGuard],
        data: {
          expectedRole: ['Manager', 'User']
        },
        canLoad: [RoleguardService, AuthGuard],
      },
      {
        // tslint:disable-next-line: max-line-length
        path: 'appTrend',
        loadChildren: () => import('../../../projects/AppTrend/src/app/app.module').then(m => m.AppTrendSharedModule),
        canActivate: [AuthGuard]
      },
      {
        // tslint:disable-next-line: max-line-length
        path: 'appEnergy',
        loadChildren: () => import('../../../projects/AppEnergy/src/app/app.module').then(m => m.AppEnergySharedModule),
        canActivate: [AuthGuard]
      },
      {
        // tslint:disable-next-line: max-line-length
        path: 'appSales',
        loadChildren: () => import('../../../projects/AppSales/src/app/app.module').then(m => m.AppSalesSharedModule),
        canActivate: [AuthGuard]
      },
      {
        // tslint:disable-next-line: max-line-length
        path: 'appInventory',
        loadChildren: () => import('../../../projects/AppInventory/src/app/app.module').then(m => m.AppInventorySharedModule),
        canActivate: [AuthGuard]
      },
      {
        // tslint:disable-next-line: max-line-length
        path: 'appGRN',
        loadChildren: () => import('../../../projects/AppGRN/src/app/app.module').then(m => m.AppGRNSharedModule),
        canActivate: [AuthGuard]
      },
      {
        // tslint:disable-next-line: max-line-length
        path: 'appBilling',
        loadChildren: () => import('../../../projects/AppBilling/src/app/app.module').then(m => m.AppBillingSharedModule),
        canActivate: [AuthGuard]
      },
      {
        // tslint:disable-next-line: max-line-length
        path: 'appOrderProcessing',
        loadChildren: () => import('../../../projects/AppOrderProcessing/src/app/app.module').then(m => m.AppOrderProcessingSharedModule),
        canActivate: [AuthGuard]
      },
      {
        // tslint:disable-next-line: max-line-length
        path: 'appIndoor',
        loadChildren: () => import('../../../projects/AppIndoorAirQuality/src/app/app.module').then(m => m.AppIAQSharedModule),
        canActivate: [AuthGuard],
        data: {
          expectedRole: ['Manager', 'User']
        },
        canLoad: [RoleguardService, AuthGuard],
      },
      {
        // tslint:disable-next-line: max-line-length
        path: 'appEvolution',
        loadChildren: () => import('../../../projects/AppEvaluationDataReport/src/app/app.module').then(m => m.EvoluationDataSharedModule),
        canActivate: [AuthGuard]
      },
      {
        // tslint:disable-next-line: max-line-length
        path: 'appFTR',
        loadChildren: () => import('../../../projects/AppFieldTrailReport/src/app/app.module').then(m => m.AppFieldTrailSharedModule),
        canActivate: [AuthGuard]
      },
      {
        // tslint:disable-next-line: max-line-length
        path: 'appReturns',
        loadChildren: () => import('../../../projects/AppReturns/src/app/app.module').then(m => m.AppReturnsSharedModule),
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: 'analytic/:tId',
    component: AnalyticComponent,
    canActivate: [AuthGuard] // Add any authentication guard if needed
  },
  // {
  //   path: 'h-dash-board',
  //   component: HDashBoardComponent,
  //   data: {
  //     expectedRole: ['Manager']
  //   },
  //   canActivate: [RoleguardService,AuthGuard],
  // },

  {
    path: 'home-dashboard',
    component: HomeDashboardComponent,
    data: {
      expectedRole: ['Manager']
    },
    canActivate: [RoleguardService, AuthGuard],
  },
  {
    path: 'tDashboard/:tId',
    component: TenantDashboardComponent,
    data: {
      expectedRole: ['Manager']
    },
    canActivate: [RoleguardService, AuthGuard],
  },
  {
    path: 'tDashboard/:tId/:subRpt',
    component: SubReportsComponent,
    data: {
      expectedRole: ['Manager']
    },
    canActivate: [RoleguardService, AuthGuard],
  },
  {
    path: 'sysactivity',
    component: SystemActivitiesComponent,
    data: {
      expectedRole: ['Manager']
    },
    canActivate: [RoleguardService, AuthGuard],
  },
  {
    path: 'sysactivity/Dashboard',
    component: SystemActivitiesComponent,
    data: {
      expectedRole: ['Manager']
    },
    canActivate: [RoleguardService, AuthGuard],
  },
  {
    path: 'sysactivity/DataSources',
    component: SystemActivitiesComponent,
    data: {
      expectedRole: ['Manager']
    },
    canActivate: [RoleguardService, AuthGuard],
  },
  {
    path: 'sysactivity/DataFlows',
    component: SystemActivitiesComponent,
    data: {
      expectedRole: ['Manager']
    },
    canActivate: [RoleguardService, AuthGuard],
  },
  {
    path: 'sysactivity/Reports',
    component: SystemActivitiesComponent,
    data: {
      expectedRole: ['Manager']
    },
    canActivate: [RoleguardService, AuthGuard],
  },
  {
    path: 'sysactivity/Databases',
    component: SystemActivitiesComponent,
    data: {
      expectedRole: ['Manager']
    },
    canActivate: [RoleguardService, AuthGuard],
  },


  {
    path: 'tenant',
    component: TenantComponent,
    data: {
      expectedRole: ['Manager']
    },
    canActivate: [RoleguardService, AuthGuard],
  },
  {
    path: 'marketplace',
    component: MarketplaceComponent,
    data: {
      expectedRole: ['Manager']
    },
    canActivate: [RoleguardService, AuthGuard],
  },
  {
    path: 'admin',
    component: AdminComponent,
    data: {
      expectedRole: ['Manager']
    },
    canActivate: [RoleguardService, AuthGuard],
  },
  {
    path: 'admin/user-reports/:type/:id',
    component: UserReportsComponent,
    data: {
      expectedRole: ['Manager']
    },
    canActivate: [RoleguardService, AuthGuard],
  },
  {
    path: 'admin/report-users/:appId/:rptId',
    component: ReportUsersComponent,
    data: {
      expectedRole: ['Manager']
    },
    canActivate: [RoleguardService, AuthGuard],
  },
  {
    path: 'admin/user/:type/:id',
    component: NewUserComponent,
    data: {
      expectedRole: ['Manager']
    },
    canActivate: [RoleguardService, AuthGuard],
  },
  {
    path: 'scheduler/:type/:appId/:templateId/:reportId/:id',
    component: SchedulerComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'flowScheduler/:flowType/:dataSourceId/:id',
    component: FlowSchedulerComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'schedulesList',
    component: SchedulerReportsListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'template-manager',
    loadChildren: () => import('./template-manager/template-manager.module').then(m => m.TemplateManagerModule),
    data: {
      expectedRole: ['Manager']
    },
    canActivate: [RoleguardService, AuthGuard],
  },
  {
    path: 'profile/:id',
    component: ProfileInfoComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'flow',
    loadChildren: () => import('./flow/flow.module').then(m => m.FlowModule),
    data: {
      expectedRole: ['Manager']
    },
    canActivate: [RoleguardService, AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
