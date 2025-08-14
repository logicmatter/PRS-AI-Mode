import { SafePipe } from "./../PmCore/shared/safe.pipe";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DatePipe } from '@angular/common';


// Forms
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

// Material
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { DragDropModule } from '@angular/cdk/drag-drop';
// owl Date Time Picker
import { OwlDateTimeModule, OwlNativeDateTimeModule } from "ng-pick-datetime-ex";
import { ConfirmationDialogComponent } from "./confirmation-dialog/confirmation-dialog.component";
import { ScheduledFilesDialogComponent } from "./scheduled-files-dialog/scheduled-files-dialog.component";
import { FilterComponent } from "./filter/filter.component";
import { RptListComponent } from "./rpt-list/rpt-list.component";
import { DataSourceListComponent } from "../pages/flow/data-source-list/data-source-list.component";
import { RptPaginationComponent } from "./rpt-pagination/rpt-pagination.component";

import { DeleteDialog } from "../PmCore/shared/app-util.service";
import { OnlydigitDirective } from "../PmCore/shared/onlydigit.directive";
import { SpinnerModule } from './spinner/spinner.module';

// Ngx-Pagination
import { NgxPaginationModule } from "ngx-pagination";

// Ng2-Search-filter
import { Ng2SearchPipeModule } from "ng2-search-filter";

// Order Pipe
import { OrderModule, OrderPipe } from "ngx-order-pipe";
import { ErrorPageComponent } from './error-page/error-page.component';
import { RouterModule, Routes } from '@angular/router';
import { RptResolutionsComponent } from './rpt-resolutions/rpt-resolutions.component';
import { ObjectSelectionComponent } from './object-selection/object-selection.component';
import { FilterPipe } from "../PmCore/helpers/filter.pipe";
import { AppHeaderComponent } from './app-header/app-header.component';
import { AppParametersComponent } from './app-parameters/app-parameters.component';

import { ViewReportComponent } from './view-report/view-report.component';
import { AppShowReportComponent } from "./app-show-report/app-show-report.component";
import { RoomEquipmentSelectionComponent } from "./room-equipment-selection/room-equipment-selection.component";
import { LocationSelectionComponent } from "./location-selection/location-selection.component";
const routes: Routes = [
  {
    path: 'unAuthorized',
    component: ErrorPageComponent
  }
]
@NgModule({
  declarations: [
    ConfirmationDialogComponent,
    ScheduledFilesDialogComponent,
    FilterComponent,
    RptListComponent,
    RptPaginationComponent,
    OnlydigitDirective,
    DeleteDialog,
    SafePipe,
    ErrorPageComponent,
    RptResolutionsComponent,
    ObjectSelectionComponent,
    FilterPipe,
    AppHeaderComponent,
    AppParametersComponent,
    AppShowReportComponent,
    ViewReportComponent,
    LocationSelectionComponent,
    RoomEquipmentSelectionComponent,
    DataSourceListComponent
  ],
  providers: [DatePipe],
  imports: [
    RouterModule.forChild(routes),
    NgxPaginationModule,
    CommonModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatSelectModule,
    MatPaginatorModule,
    MatButtonModule,
    SpinnerModule,
    Ng2SearchPipeModule,
    OrderModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatCheckboxModule,
    DragDropModule
  ],
  entryComponents: [DeleteDialog, ScheduledFilesDialogComponent],
  exports: [
    MatDialogModule,
    FilterComponent,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    RptListComponent,
    RptPaginationComponent,
    OnlydigitDirective,
    SafePipe,
    Ng2SearchPipeModule,
    OrderModule,
    RptResolutionsComponent,
    ObjectSelectionComponent,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatCheckboxModule,
    FilterPipe,
    AppHeaderComponent,
    AppParametersComponent,
    AppShowReportComponent,
    ViewReportComponent,
    RoomEquipmentSelectionComponent,
    LocationSelectionComponent,
    DataSourceListComponent
  ]
})
export class CoreModule { }
