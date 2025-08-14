import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchObjsComponent } from './search-objs/search-objs.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { OrderModule } from 'ngx-order-pipe';
import { SpinnerModule } from 'src/app/core/spinner/spinner.module';
import { CoreModule } from 'src/app/core/core.module';
import { RouterModule } from '@angular/router';
import { ObjSearchRoutingModule } from './obj-search-routing.module';
import { SearchModule } from './search.module';
import { DeviceSearchComponent } from './device-search/device-search.component';
import { DeviceSearchDetailsComponent } from './device-search/device-search-details/device-search-details.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { DragDropModule } from '@angular/cdk/drag-drop';
@NgModule({
  declarations: [
    SearchObjsComponent,
    DeviceSearchComponent,
    DeviceSearchDetailsComponent],
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
    ObjSearchRoutingModule,
    SearchModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatCheckboxModule,
    DragDropModule
  ],
  exports: [
    MatCardModule,
    RouterModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    NgxPaginationModule,
    OrderModule,
    MatTabsModule,
    Ng2SearchPipeModule,
    SpinnerModule,
    ObjSearchRoutingModule,
    SearchModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatCheckboxModule
  ]
})
export class ObjSearchModule { }
