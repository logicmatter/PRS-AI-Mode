import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout.component';
import { FooterComponent } from './footer/footer.component';
import { RouterModule, Routes } from '@angular/router';
import { SideNavComponent } from './side-nav/side-nav.component';
import { ToolbarComponent, SearchDialog, DateRangeDialog } from './toolbar/toolbar.component';
import { HomeComponent } from './home/home.component';
import { OrderModule } from 'ngx-order-pipe';
// Modules
import { CoreModule } from '../core/core.module';
import { CommondatepickerModule } from '../core/commondatepicker/commondatepicker.module';
// Forms
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { UserIdleModule } from 'angular-user-idle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';


// owl Date Time Picker
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime-ex';

import { SessionDialog } from './home/home.component';
import { LayoutRoutingModule } from './layout-routing.module';
import { TenantHeaderComponent } from './tenant-header/tenant-header.component';
const routes: Routes = [];

@NgModule({
  declarations: [
    LayoutComponent,
    FooterComponent,
    SideNavComponent,
    ToolbarComponent,
    SearchDialog,
    DateRangeDialog,
    SessionDialog,
    HomeComponent,
    TenantHeaderComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatSelectModule,
    MatDialogModule,
    MatMenuModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    CoreModule,
    CommondatepickerModule,
    LayoutRoutingModule,
    OrderModule,
    UserIdleModule.forRoot({ idle: 3000, timeout: 900, ping: 120 })
  ],
  exports: [
    LayoutComponent,
    HomeComponent,
    FooterComponent,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    LayoutComponent,
    FooterComponent,
    SideNavComponent,
    ToolbarComponent,
    HomeComponent,
    CoreModule
  ],
  entryComponents: [SearchDialog, DateRangeDialog, SessionDialog]
})
export class LayoutModule { }
