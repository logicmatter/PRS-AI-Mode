import { AppTrendSharedModule } from './../../projects/AppTrend/src/app/app.module';
import { AppCrEqSharedModule } from './../../projects/AppCrEqp/src/app/app.module';
// Angular
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Model Components
import { PagesModule } from './pages/index';
import { AuthGuard } from './guards/auth-guard.service';
// tslint:disable-next-line: max-line-length
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

//Apps
import { AppIAQSharedModule } from 'projects/AppIndoorAirQuality/src/app/app.module';
import { EvoluationDataSharedModule } from 'projects/AppEvaluationDataReport/src/app/app.module';
import { AppFieldTrailSharedModule } from 'projects/AppFieldTrailReport/src/app/app.module';
import { AppCrEnvSharedModule } from 'projects/AppCrEnv/src/app/app.module';
import { AppAlarmSharedModule } from './../../projects/AppAlarm/src/app/app.module';
import { AppAdhocSharedModule } from 'projects/AppAdhoc/src/app/app.module';
import { AppEnergySharedModule } from 'projects/AppEnergy/src/app/app.module';
import { AppSalesSharedModule } from 'projects/AppSales/src/app/app.module';
import { AppInventorySharedModule } from 'projects/AppInventory/src/app/app.module';
import { AppGRNSharedModule } from 'projects/AppGRN/src/app/app.module';
import { AppBillingSharedModule } from 'projects/AppBilling/src/app/app.module';
import { AppOrderProcessingSharedModule } from 'projects/AppOrderProcessing/src/app/app.module';
import { AppReturnsSharedModule } from 'projects/AppReturns/src/app/app.module';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/index').then(m => m.AuthModule),
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/index').then(m => m.PagesModule),
    canActivate: [AuthGuard]
  },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' }
];

@NgModule({
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule,
    PagesModule,
    RouterModule.forRoot(routes),
    AppIAQSharedModule.forRoot(),
    EvoluationDataSharedModule.forRoot(),
    AppFieldTrailSharedModule.forRoot(),
    AppCrEnvSharedModule.forRoot(),
    AppAlarmSharedModule.forRoot(),
    AppCrEqSharedModule.forRoot(),
    AppTrendSharedModule.forRoot(),
    AppEnergySharedModule.forRoot(),
    AppAdhocSharedModule.forRoot(),
    AppSalesSharedModule.forRoot(),
    AppInventorySharedModule.forRoot(),
    AppGRNSharedModule.forRoot(),
    AppBillingSharedModule.forRoot(),
    AppOrderProcessingSharedModule.forRoot(),
    AppReturnsSharedModule.forRoot(),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
