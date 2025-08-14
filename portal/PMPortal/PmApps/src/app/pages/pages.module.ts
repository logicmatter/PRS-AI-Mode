import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { TenantComponent } from './tenant/tenant.component';
import { AppsComponent } from './apps/apps.component';
import { AdminComponent } from './admin/admin.component';
import { TemplateManagerModule } from './template-manager/template-manager.module';
import { UserReportsComponent } from './admin/user-reports/user-reports.component';
import { ReportUsersComponent } from './admin/report-users/report-users.component';
import { NewUserComponent } from './admin/new-user/new-user.component';
import { MarketplaceComponent } from './marketplace/marketplace.component';
import { SchedulerComponent } from "./scheduler/scheduler.component";
import { FlowSchedulerComponent } from "./scheduler/flow/flow-scheduler.component";
import { SchedulerReportsListComponent } from "./scheduler/scheduler-reports-list/scheduler-reports-list.component";
import { AppCrEnvSharedModule } from '../../../projects/AppCrEnv/src/app/app.module';
// Material../core/date-picker/date-picker.component
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../PmCore/shared/material-module';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SystemActivitiesModule } from './system-activities/system-activities.module';
import { LayoutModule } from '../layout/layout.module';
import { CoreModule } from '../core/core.module';
import { CommondatepickerModule } from '../core/commondatepicker/commondatepicker.module';
import { SearchModule } from './search/search.module';
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";
import { ProfileInfoComponent } from './UserSettings/profile-info/profile-info.component';

import { FlowModule } from './flow/flow.module'; import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DragDropModule } from '@angular/cdk/drag-drop';

//import { HDashBoardComponent } from './h-dash-board/h-dash-board.component';
import { HomeDashboardComponent } from './home-dashboard/home-dashboard.component';
import { TenantDashboardComponent } from './tenant-dashboard/tenant-dashboard.component';
import { SubReportsComponent } from './sub-reports/sub-reports.component';
import { AnalyticComponent } from './analytic/analytic.component';



@NgModule({
  declarations: [
    TenantComponent,
    AppsComponent,
    MarketplaceComponent,
    AdminComponent,
    UserReportsComponent,
    ReportUsersComponent,
    NewUserComponent,
    SchedulerComponent,
    FlowSchedulerComponent,
    SchedulerReportsListComponent,
    ProfileInfoComponent,
    //HDashBoardComponent,
    HomeDashboardComponent,
    TenantDashboardComponent,
    SubReportsComponent,
    AnalyticComponent,
  ],
  imports: [
    MaterialModule,
    CommonModule,
    PagesRoutingModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatSelectModule,
    MatExpansionModule,
    MatTabsModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSlideToggleModule,
    CoreModule,
    SystemActivitiesModule,
    LayoutModule,
    CommondatepickerModule,
    SearchModule,
    TemplateManagerModule,
    AngularMultiSelectModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatCheckboxModule,
    FlowModule,
    DragDropModule
  ],
  exports: [
    MaterialModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatSelectModule,
    MatExpansionModule,
    MatTabsModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSlideToggleModule,
    TenantComponent,
    AppsComponent,
    MarketplaceComponent,
    AdminComponent,
    UserReportsComponent,
    ReportUsersComponent,
    NewUserComponent,
    SchedulerComponent,
    FlowSchedulerComponent,
    SchedulerReportsListComponent,
    SearchModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatCheckboxModule,
    // HDashBoardComponent,
    HomeDashboardComponent,
    //TemplateManagerModule,
    SystemActivitiesModule
  ]
})
export class PagesModule { }
