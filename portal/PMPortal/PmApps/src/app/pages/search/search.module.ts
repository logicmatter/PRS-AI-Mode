import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchHomeComponent } from './search-home/search-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { OrderModule } from 'ngx-order-pipe';
import { SpinnerModule } from 'src/app/core/spinner/spinner.module';
import { CoreModule } from 'src/app/core/core.module';
import { RouterModule } from '@angular/router';
import { SearchRoutingModule } from './search-routing.module';
import { AlarmComponent } from './alarm/alarm.component';
import { AlarmDetailComponent } from './alarm/alarm-detail/alarm-detail.component';
import { TrendlogComponent } from './trendlog/trendlog.component';
import { TrendlogDetailsComponent } from './trendlog/trendlog-details/trendlog-details.component';
import { DeviceComponent } from './device/device.component';
import { DeviceDetailsComponent } from './device/device-details/device-details.component';
import { EnergylogComponent } from './energylog/energylog.component';
import { EnergyDetailsComponent } from './energylog/energy-details/energy-details.component';
import { ReportsComponent } from './reports/reports.component';
import { PointsComponent } from './points/points.component';
import { PointDetailsComponent } from './points/point-details/point-details.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { ScrollDirective } from './scroll-directive';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    SearchHomeComponent,
    AlarmComponent,
    AlarmDetailComponent,
    TrendlogComponent,
    TrendlogDetailsComponent,
    DeviceComponent,
    DeviceDetailsComponent,
    EnergylogComponent,
    EnergyDetailsComponent,
    ReportsComponent,
    PointsComponent,
    ScrollDirective,
    PointDetailsComponent],
  imports: [
    FormsModule,
    CommonModule,
    MatCardModule,
    NgxPaginationModule,
    Ng2SearchPipeModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    OrderModule,
    SpinnerModule,
    CoreModule,
    MatTabsModule,
    SearchRoutingModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatCheckboxModule,
    AngularMultiSelectModule,
    MatSelectModule,
    DragDropModule
  ],
  exports: [
    MatCardModule,
    RouterModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    NgxPaginationModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatCheckboxModule,
    OrderModule,
    MatTabsModule,
    Ng2SearchPipeModule,
    SpinnerModule,
    SearchRoutingModule,
    TrendlogComponent,
    AlarmComponent,
    EnergylogComponent,
    AngularMultiSelectModule,
    MatSelectModule,
    DragDropModule
  ]
})
export class SearchModule {

}
