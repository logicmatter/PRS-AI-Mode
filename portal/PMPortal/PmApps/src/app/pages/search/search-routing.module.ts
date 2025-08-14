import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthGuard } from 'src/app/guards/auth-guard.service';
import { SearchHomeComponent } from './search-home/search-home.component';
import { Routes, RouterModule } from '@angular/router';
import { AlarmComponent } from './alarm/alarm.component';
import { DeviceComponent } from './device/device.component';
import { TrendlogComponent } from './trendlog/trendlog.component';
import { EnergylogComponent } from './energylog/energylog.component';
import { PointsComponent } from './points/points.component';
import { ReportsComponent } from './reports/reports.component';
import { AlarmDetailComponent } from './alarm/alarm-detail/alarm-detail.component';
import { DeviceDetailsComponent } from './device/device-details/device-details.component';
import { TrendlogDetailsComponent } from './trendlog/trendlog-details/trendlog-details.component';
import { EnergyDetailsComponent } from './energylog/energy-details/energy-details.component';
import { PointDetailsComponent } from './points/point-details/point-details.component';

const routes: Routes = [
  {
    path: '',
    component: SearchHomeComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'alarm', pathMatch: 'full' },
      {
        path: 'alarm',
        component : AlarmComponent,
        canActivate: [AuthGuard],data: { label: 'Alarm' },
        children: [
          {
            path: 'alarmDetail',
            component: AlarmDetailComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'deviceDetail',
            component: DeviceDetailsComponent,
            canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'trendlog',
       component: TrendlogComponent,
        canActivate: [AuthGuard],data: { label: 'Trendlog' },
        children: [
          {
            path: 'trendDetail',
            component: TrendlogDetailsComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'deviceDetail',
            component: DeviceDetailsComponent,
            canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'energylog',
        component: EnergylogComponent,
        canActivate: [AuthGuard],data: { label: 'Energy Log' },
        children: [
          {
            path: 'energyDetail',
            component: EnergyDetailsComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'deviceDetail',
            component: DeviceDetailsComponent,
            canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'device',
        component: DeviceComponent,
        canActivate: [AuthGuard],data: { label: 'Device' },
        children: [
          {
            path: 'trendlog',
            component: TrendlogComponent,
            canActivate: [AuthGuard], data: { label: 'Trendlog' },
            children: [
              {
                path: 'trendDetail',
                component: TrendlogDetailsComponent,
                canActivate: [AuthGuard]
              },
              {
                path: 'deviceDetail',
                component: DeviceDetailsComponent,
                canActivate: [AuthGuard]
              }
            ]
          },
          {
            path: 'alarm',
            component: AlarmComponent,
            canActivate: [AuthGuard], data: { label: 'Alarm' },
            children: [
              {
                path: 'alarmDetail',
                component: AlarmDetailComponent,
                canActivate: [AuthGuard]
              },
              {
                path: 'deviceDetail',
                component: DeviceDetailsComponent,
                canActivate: [AuthGuard]
              }
            ]
          },
          {
            path: 'energylog',
            component: EnergylogComponent,
            canActivate: [AuthGuard],data: { label: 'Energy Log' },
            children: [
              {
                path: 'energyDetail',
                component: EnergyDetailsComponent,
                canActivate: [AuthGuard]
              },
              {
                path: 'deviceDetail',
                component: DeviceDetailsComponent,
                canActivate: [AuthGuard]
              }
            ]
          },
          {
            path: 'points',
           component: PointsComponent,
            canActivate: [AuthGuard],data: { label: 'Points' },
            children:[
              {
                path: 'pointDetail',
                component: PointDetailsComponent,
                canActivate: [AuthGuard]
              },
              {
                path: 'deviceDetail',
                component: DeviceDetailsComponent,
                canActivate: [AuthGuard]
              },
            ]
          },
          {
            path: 'deviceDetail',
            component: DeviceDetailsComponent,
            canActivate: [AuthGuard]
          },
          
        ]
      },
      {
        path: 'points',
       component: PointsComponent,
        canActivate: [AuthGuard],data: { label: 'Points' },
        children:[
          {
            path: 'pointDetail',
            component: PointDetailsComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'deviceDetail',
            component: DeviceDetailsComponent,
            canActivate: [AuthGuard]
          },
        ]
      },
      
      {
        path: 'reports',
        component: ReportsComponent,
        canActivate: [AuthGuard],data: { label: 'Reports' }
      },
      {
        path: 'transformers',
        component: ReportsComponent,
        canActivate: [AuthGuard],data: { label: 'Transformers' }
      }
    ]
  }

]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchRoutingModule { }
